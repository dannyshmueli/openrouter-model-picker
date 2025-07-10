import { OpenRouterResponse, ModelInfo, OpenRouterModel } from '../types'

const DEFAULT_API_ENDPOINT = 'https://openrouter.ai/api/v1/models'
const CHAT_COMPLETION_ENDPOINT = 'https://openrouter.ai/api/v1/chat/completions'

export class ApiClient {
  private endpoint: string
  private cache: ModelInfo[] | null = null
  private cacheTimestamp: number = 0
  private readonly CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

  constructor(endpoint?: string) {
    this.endpoint = endpoint || DEFAULT_API_ENDPOINT
  }

  async fetchModels(forceRefresh = false): Promise<ModelInfo[]> {
    // Return cached data if still valid
    if (!forceRefresh && this.cache && Date.now() - this.cacheTimestamp < this.CACHE_DURATION) {
      return this.cache
    }

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      }

      const response = await fetch(this.endpoint, { headers })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: OpenRouterResponse = await response.json()
      
      // Log filtering stats
      const totalModels = data.data.length
      const filteredRawModels = this.filterAvailableModels(data.data)
      const filteredCount = totalModels - filteredRawModels.length
      
      console.log(`📊 Model filtering stats: ${totalModels} total → ${filteredRawModels.length} available (${filteredCount} filtered out)`)
      
      const models = filteredRawModels.map(model => this.transformModel(model))
      
      // Cache the results
      this.cache = models
      this.cacheTimestamp = Date.now()
      
      return models
    } catch (error) {
      console.error('Failed to fetch models from OpenRouter:', error)
      
      // Return cached data if available, otherwise fallback models
      if (this.cache) {
        return this.cache
      }
      
      return this.getFallbackModels()
    }
  }

  /**
   * Test a model with an actual API call
   */
  async testModel(modelId: string, apiKey: string, testMessage: string = "Hello! Please respond with a brief greeting."): Promise<{
    success: boolean
    response?: string
    error?: string
    usage?: {
      prompt_tokens: number
      completion_tokens: number
      total_tokens: number
    }
  }> {
    if (!apiKey) {
      return {
        success: false,
        error: 'API key is required for testing models'
      }
    }

    try {
      const response = await fetch(CHAT_COMPLETION_ENDPOINT, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: modelId,
          messages: [
            { role: 'user', content: testMessage }
          ],
          max_tokens: 100, // Keep it short for testing
          temperature: 0.7
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        return {
          success: false,
          error: `HTTP ${response.status}: ${errorData.error?.message || response.statusText}`
        }
      }

      const data = await response.json()
      
      return {
        success: true,
        response: data.choices?.[0]?.message?.content || 'No response content',
        usage: data.usage
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  /**
   * Filter out models with known availability issues
   */
  private filterAvailableModels(models: OpenRouterModel[]): OpenRouterModel[] {
    return models.filter(model => {
      // Filter out models with zero or invalid context length
      if (!model.context_length || model.context_length <= 0) {
        console.debug(`Filtered out model ${model.id}: invalid context length (${model.context_length})`)
        return false
      }
      
      // Enhanced deprecated model detection
      const isDeprecated = this.isModelDeprecated(model)
      if (isDeprecated) {
        console.debug(`Filtered out model ${model.id}: deprecated`)
        return false
      }
      
      // Filter out models with no capacity limits (often indicates unavailability)
      if (model.per_request_limits) {
        const promptTokens = parseInt(model.per_request_limits.prompt_tokens || '0')
        const completionTokens = parseInt(model.per_request_limits.completion_tokens || '0')
        
        if (promptTokens <= 0 && completionTokens <= 0) {
          console.debug(`Filtered out model ${model.id}: zero capacity limits`)
          return false
        }
      }
      
      // Filter out models with invalid pricing (both prompt and completion are undefined/null)
      if (!model.pricing || (!model.pricing.prompt && !model.pricing.completion)) {
        console.debug(`Filtered out model ${model.id}: invalid pricing`)
        return false
      }
      
      // Filter out models with malformed IDs
      if (!model.id || model.id.trim() === '') {
        console.debug(`Filtered out model: empty or invalid ID`)
        return false
      }
      
      // Filter out known problematic model patterns
      if (this.isKnownProblematicModel(model.id)) {
        console.debug(`Filtered out model ${model.id}: known problematic model`)
        return false
      }
      
      return true
    })
  }

  /**
   * Check if a model is deprecated using multiple detection strategies
   */
  private isModelDeprecated(model: OpenRouterModel): boolean {
    // Check instruct_type for deprecated keyword
    if (model.architecture?.instruct_type?.toLowerCase().includes('deprecated')) {
      return true
    }
    
    // Check description for deprecation keywords
    if (model.description) {
      const description = model.description.toLowerCase()
      const deprecationKeywords = [
        'deprecated',
        'has been deprecated',
        'please switch to',
        'no longer supported',
        'discontinued',
        'replaced by'
      ]
      
      if (deprecationKeywords.some(keyword => description.includes(keyword))) {
        return true
      }
    }
    
    // Check for specific known deprecated model patterns
    const deprecatedPatterns = [
      /.*-exp-\d{2}-\d{2}$/, // Experimental models with date endings like "exp-03-25"
      /.*experimental.*$/i,  // Models with "experimental" in the name
    ]
    
    if (deprecatedPatterns.some(pattern => pattern.test(model.id))) {
      // Additional check: if it's an experimental model AND has $0 pricing, it might be deprecated
      const inputCost = parseFloat(model.pricing?.prompt || '0')
      const outputCost = parseFloat(model.pricing?.completion || '0')
      
      if (inputCost === 0 && outputCost === 0) {
        return true
      }
    }
    
    return false
  }

  /**
   * Check for known problematic model IDs that consistently cause issues
   */
  private isKnownProblematicModel(modelId: string): boolean {
    const problematicModels = [
      'google/gemini-2.5-pro-exp-03-25', // Known deprecated model causing 404s
      // Add other known problematic models here as they're discovered
    ]
    
    return problematicModels.includes(modelId)
  }

  /**
   * Categorize models into free and paid
   */
  categorizeModels(models: ModelInfo[]): { freeModels: ModelInfo[], paidModels: ModelInfo[] } {
    const freeModels: ModelInfo[] = []
    const paidModels: ModelInfo[] = []
    
    models.forEach(model => {
      if (model.costTier === 'free') {
        freeModels.push(model)
      } else {
        paidModels.push(model)
      }
    })
    
    return { freeModels, paidModels }
  }

  private transformModel(model: OpenRouterModel): ModelInfo {
    const provider = this.extractProvider(model.id)
    const costTier = this.calculateCostTier(model.pricing)
    const features = this.extractFeatures(model)

    return {
      id: model.id, // CRITICAL: Use exact model ID without modification
      name: model.name,
      provider,
      costTier,
      description: model.description || 'No description available',
      features,
      pricing: {
        input: parseFloat(model.pricing.prompt) || 0,
        output: parseFloat(model.pricing.completion) || 0,
        currency: 'USD'
      },
      context: model.context_length,
      multimodal: this.isMultimodal(model),
      reasoning: this.isReasoningModel(model),
      streamCancel: this.supportsStreamCancellation(model)
    }
  }

  private extractProvider(modelId: string): string {
    const parts = modelId.split('/')
    if (parts.length > 1) {
      const provider = parts[0]
      // Capitalize first letter
      return provider.charAt(0).toUpperCase() + provider.slice(1)
    }
    return 'Unknown'
  }

  private calculateCostTier(pricing: { prompt: string; completion: string }): 'free' | 'low' | 'medium' | 'high' {
    const inputCost = parseFloat(pricing.prompt) || 0
    const outputCost = parseFloat(pricing.completion) || 0
    
    // Both input and output must be 0 for free tier
    if (inputCost === 0 && outputCost === 0) return 'free'
    
    const avgCost = (inputCost + outputCost) / 2

    if (avgCost < 0.000001) return 'low'     // < $0.001 per 1K tokens
    if (avgCost < 0.00001) return 'medium'   // < $0.01 per 1K tokens
    return 'high'
  }

  private extractFeatures(model: OpenRouterModel): string[] {
    const features: string[] = []
    
    if (model.architecture.input_modalities?.includes('image') || 
        model.architecture.modality === 'multimodal') {
      features.push('Vision')
    }
    
    if (this.isReasoningModel(model)) {
      features.push('Reasoning')
    }
    
    if (this.supportsStreamCancellation(model)) {
      features.push('Stream Cancel')
    }
    
    if (model.top_provider.is_moderated) {
      features.push('Moderated')
    }
    
    if (model.context_length > 100000) {
      features.push('Long Context')
    }
    
    if (model.architecture.instruct_type) {
      features.push('Instruct')
    }

    // Add free indicator for free models
    const inputCost = parseFloat(model.pricing.prompt) || 0
    const outputCost = parseFloat(model.pricing.completion) || 0
    if (inputCost === 0 && outputCost === 0) {
      features.push('Free')
    }

    return features
  }

  private isMultimodal(model: OpenRouterModel): boolean {
    return model.architecture.input_modalities?.includes('image') || 
           model.architecture.modality === 'multimodal' || false
  }

  private isReasoningModel(model: OpenRouterModel): boolean {
    const modelId = model.id?.toLowerCase() || '';
    
    // ⚠️ WARNING: This is pattern-based detection, not an official API field!
    // 
    // The `internal_reasoning` field in the pricing object indicates the COST PER REASONING TOKEN,
    // not whether the model supports reasoning. A value of "0" means reasoning tokens are free,
    // while a non-zero value indicates a cost per token. Many non-reasoning models have this field
    // present with a value of 0 or null.
    //
    // This pattern matching approach:
    // - May miss new reasoning models with different naming patterns
    // - Requires manual updates when new reasoning models are released
    // - Is based on OpenRouter's official documentation as of January 2025
    // 
    // TODO: Replace with official API field when OpenRouter provides one
    
    // Use conservative pattern matching for known reasoning models based on OpenRouter's official docs:
    // - DeepSeek R1 models (and derived models)
    // - Gemini Thinking models  
    // - Anthropic reasoning models
    // - OpenAI o-series (though they don't return reasoning tokens)
    // - Grok reasoning models
    // - Other known reasoning patterns
    
    const reasoningPatterns = [
      /\bo1(-preview|-mini)?\b/i,           // OpenAI o1, o1-preview, o1-mini
      /\bdeepseek.*r1\b/i,                  // DeepSeek R1 variants
      /\bgemini.*thinking\b/i,              // Gemini Thinking models
      /\bclaude.*thinking/i,                // Claude thinking variants (e.g., claude-3.7-sonnet:thinking)
      /anthropic.*thinking/i,               // Anthropic thinking models (covers anthropic/claude-3.7-sonnet:thinking)
      /\bgrok.*reasoning\b/i,               // Grok reasoning models
      /\bminimax.*m1\b/i,                   // MiniMax M1 reasoning models
      /\bqwen.*r1\b/i,                      // Qwen R1 reasoning models
      /reasoning.*model/i,                  // Generic reasoning model names
      /thinking.*model/i                    // Generic thinking model names
    ];
    
    return reasoningPatterns.some(pattern => pattern.test(modelId));
  }

  private supportsStreamCancellation(model: OpenRouterModel): boolean {
    const provider = this.extractProvider(model.id).toLowerCase();
    
    // Based on OpenRouter's official documentation for stream cancellation support
    // https://openrouter.ai/docs/api-reference/streaming#stream-cancellation
    
    const supportedProviders = new Set([
      'openai', 'azure', 'anthropic',
      'fireworks', 'mancer', 'recursal',
      'anyscale', 'lepton', 'octoai',
      'novita', 'deepinfra', 'together',
      'cohere', 'hyperbolic', 'infermatic',
      'avian', 'xai', 'cloudflare',
      'sfcompute', 'nineteen', 'liquid',
      'friendli', 'chutes', 'deepseek'
    ]);
    
    return supportedProviders.has(provider);
  }

  private getFallbackModels(): ModelInfo[] {
    return [
      {
        id: 'openai/gpt-4o-mini',
        name: 'GPT-4o Mini',
        provider: 'OpenAI', 
        costTier: 'low',
        description: 'Fast and affordable multimodal model',
        features: ['Vision', 'Fast'],
        pricing: { input: 0.00015, output: 0.0006, currency: 'USD' },
        context: 128000,
        multimodal: true,
        reasoning: false,
        streamCancel: true  // OpenAI supports stream cancellation
      },
      {
        id: 'openai/o1-preview',
        name: 'o1-preview',
        provider: 'OpenAI',
        costTier: 'high',
        description: 'Advanced reasoning model with enhanced thinking capabilities',
        features: ['Reasoning', 'Advanced'],
        pricing: { input: 0.015, output: 0.06, currency: 'USD' },
        context: 128000,
        multimodal: false,
        reasoning: true,
        streamCancel: true  // OpenAI supports stream cancellation
      },
      {
        id: 'openai/gpt-4o',
        name: 'GPT-4o',
        provider: 'OpenAI',
        costTier: 'high',
        description: 'Most capable multimodal model',
        features: ['Vision', 'Advanced'],
        pricing: { input: 0.005, output: 0.015, currency: 'USD' },
        context: 128000,
        multimodal: true,
        reasoning: false,
        streamCancel: true  // OpenAI supports stream cancellation
      },
      {
        id: 'deepseek/deepseek-r1',
        name: 'DeepSeek R1',
        provider: 'DeepSeek',
        costTier: 'medium',
        description: 'Advanced reasoning model with step-by-step thinking',
        features: ['Reasoning', 'Long Context'],
        pricing: { input: 0.002, output: 0.008, currency: 'USD' },
        context: 200000,
        multimodal: false,
        reasoning: true,
        streamCancel: true  // DeepSeek supports stream cancellation
      },
      {
        id: 'anthropic/claude-3-sonnet',
        name: 'Claude 3 Sonnet',
        provider: 'Anthropic',
        costTier: 'medium',
        description: 'Balanced performance and cost',
        features: ['Long Context'],
        pricing: { input: 0.003, output: 0.015, currency: 'USD' },
        context: 200000,
        multimodal: false,
        reasoning: false,
        streamCancel: true  // Anthropic supports stream cancellation
      },
      // Add some free models to fallback
      {
        id: 'meta-llama/llama-3.2-3b-instruct:free',
        name: 'Llama 3.2 3B Instruct (Free)',
        provider: 'Meta',
        costTier: 'free',
        description: 'Free tier access to Llama 3.2 3B',
        features: ['Free', 'Instruct'],
        pricing: { input: 0, output: 0, currency: 'USD' },
        context: 131072,
        multimodal: false,
        reasoning: false,
        streamCancel: false  // Meta/HuggingFace does not support stream cancellation
      }
    ]
  }

  clearCache(): void {
    this.cache = null
    this.cacheTimestamp = 0
  }
} 