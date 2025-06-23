import { useState, useEffect, useCallback } from 'react'
import { ModelInfo } from '../types'
import { ApiClient } from '../utils/apiClient'

interface UseModelDataReturn {
  models: ModelInfo[]
  freeModels: ModelInfo[]
  paidModels: ModelInfo[]
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
  testModel: (modelId: string, apiKey: string, testMessage?: string) => Promise<{
    success: boolean
    response?: string
    error?: string
    usage?: {
      prompt_tokens: number
      completion_tokens: number
      total_tokens: number
    }
  }>
}

export function useModelData(
  apiEndpoint?: string,
  fallbackModels?: ModelInfo[]
): UseModelDataReturn {
  const [models, setModels] = useState<ModelInfo[]>([])
  const [freeModels, setFreeModels] = useState<ModelInfo[]>([])
  const [paidModels, setPaidModels] = useState<ModelInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [apiClient] = useState(() => new ApiClient(apiEndpoint))

  const fetchModels = useCallback(async (forceRefresh = false) => {
    try {
      setLoading(true)
      setError(null)
      
      let fetchedModels: ModelInfo[]
      
      try {
        fetchedModels = await apiClient.fetchModels(forceRefresh)
      } catch (err) {
        // If API fails and we have fallback models, use them
        if (fallbackModels && fallbackModels.length > 0) {
          fetchedModels = fallbackModels
        } else {
          throw err
        }
      }
      
      setModels(fetchedModels)
      
      // Categorize models by cost tier
      const { freeModels: free, paidModels: paid } = apiClient.categorizeModels(fetchedModels)
      setFreeModels(free)
      setPaidModels(paid)
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch models'
      setError(errorMessage)
      
      // Set fallback models if available
      if (fallbackModels && fallbackModels.length > 0) {
        setModels(fallbackModels)
        const { freeModels: free, paidModels: paid } = apiClient.categorizeModels(fallbackModels)
        setFreeModels(free)
        setPaidModels(paid)
      }
    } finally {
      setLoading(false)
    }
  }, [apiClient, fallbackModels])

  const refresh = useCallback(async () => {
    await fetchModels(true)
  }, [fetchModels])

  const testModel = useCallback(async (modelId: string, apiKey: string, testMessage?: string) => {
    return await apiClient.testModel(modelId, apiKey, testMessage)
  }, [apiClient])

  useEffect(() => {
    fetchModels()
  }, [fetchModels])

  return {
    models,
    freeModels,
    paidModels,
    loading,
    error,
    refresh,
    testModel
  }
} 