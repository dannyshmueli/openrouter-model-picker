import { OpenRouterResponse, ModelInfo, OpenRouterModel } from '../types'

const DEFAULT_API_ENDPOINT = 'https://openrouter.ai/api/v1/models'

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
      const response = await fetch(this.endpoint)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: OpenRouterResponse = await response.json()
      const models = data.data.map(model => this.transformModel(model))
      
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

  private transformModel(model: OpenRouterModel): ModelInfo {
    const provider = this.extractProvider(model.id)
    const costTier = this.calculateCostTier(model.pricing)
    const features = this.extractFeatures(model)

    return {
      id: model.id,
      name: model.name,
      provider,
      costTier,
      description: model.description,
      features,
      pricing: {
        input: parseFloat(model.pricing.prompt) || 0,
        output: parseFloat(model.pricing.completion) || 0,
        currency: 'USD'
      },
      context: model.context_length,
      multimodal: this.isMultimodal(model)
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
    const avgCost = (inputCost + outputCost) / 2

    if (avgCost === 0) return 'free'
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
    
    if (model.top_provider.is_moderated) {
      features.push('Moderated')
    }
    
    if (model.context_length > 100000) {
      features.push('Long Context')
    }
    
    if (model.architecture.instruct_type) {
      features.push('Instruct')
    }

    return features
  }

  private isMultimodal(model: OpenRouterModel): boolean {
    return model.architecture.input_modalities?.includes('image') || 
           model.architecture.modality === 'multimodal' || false
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
        multimodal: true
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
        multimodal: true
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
        multimodal: false
      }
    ]
  }

  clearCache(): void {
    this.cache = null
    this.cacheTimestamp = 0
  }
} 