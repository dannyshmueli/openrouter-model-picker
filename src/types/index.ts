export interface ModelInfo {
  id: string                    // Model ID (e.g., "openai/gpt-4o")
  name: string                  // Display name
  provider: string              // Provider name
  costTier: 'free' | 'low' | 'medium' | 'high'
  description: string           // Model description
  features?: string[]           // Capability tags
  pricing?: {
    input: number              // Input token price
    output: number             // Output token price
    currency: string           // Currency code
  }
  context?: number             // Context window size
  multimodal?: boolean         // Supports images/files
}



export interface ModelChooserModalProps {
  // Core functionality
  isOpen: boolean
  onClose: () => void
  selectedModel?: string
  onModelChange: (modelId: string) => void
  
  // Customization
  apiEndpoint?: string         // Custom API endpoint
  fallbackModels?: ModelInfo[] // Fallback model data
  theme?: 'light' | 'dark' | 'auto' // Theme support with auto detection
  maxHeight?: string           // Custom modal height
  maxWidth?: string            // Custom modal width
  className?: string           // Custom CSS class
}

export interface OpenRouterModel {
  id: string
  name: string
  description: string
  pricing: {
    prompt: string    // Price per input token
    completion: string // Price per output token
  }
  context_length: number
  architecture: {
    modality?: string
    tokenizer: string
    instruct_type?: string
    input_modalities?: string[]
    output_modalities?: string[]
  }
  top_provider: {
    max_completion_tokens?: number
    is_moderated: boolean
  }
  per_request_limits?: {
    prompt_tokens?: string
    completion_tokens?: string
  }
}

export interface OpenRouterResponse {
  data: OpenRouterModel[]
}

export interface FilterState {
  searchTerm: string
  selectedProviders: string[]
  selectedCostTiers: string[]
  showMultimodal: boolean
}

export interface SortConfig {
  key: keyof ModelInfo | null
  direction: 'asc' | 'desc'
} 