import { useState, useEffect, useCallback } from 'react'
import { ModelInfo } from '../types'
import { ApiClient } from '../utils/apiClient'

interface UseModelDataReturn {
  models: ModelInfo[]
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
}

export function useModelData(
  apiEndpoint?: string,
  fallbackModels?: ModelInfo[]
): UseModelDataReturn {
  const [models, setModels] = useState<ModelInfo[]>([])
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
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch models'
      setError(errorMessage)
      
      // Set fallback models if available
      if (fallbackModels && fallbackModels.length > 0) {
        setModels(fallbackModels)
      }
    } finally {
      setLoading(false)
    }
  }, [apiClient, fallbackModels])

  const refresh = useCallback(async () => {
    await fetchModels(true)
  }, [fetchModels])

  useEffect(() => {
    fetchModels()
  }, [fetchModels])

  return {
    models,
    loading,
    error,
    refresh
  }
} 