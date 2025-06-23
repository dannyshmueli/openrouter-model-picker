import { useState, useMemo, useCallback } from 'react'
import { ModelInfo, FilterState, SortConfig } from '../types'

interface UseFilteringReturn {
  filteredModels: ModelInfo[]
  filterState: FilterState
  sortConfig: SortConfig
  updateFilter: (key: keyof FilterState, value: any) => void
  clearFilters: () => void
  setSort: (key: keyof ModelInfo | null, direction?: 'asc' | 'desc') => void
  availableProviders: string[]
  filterStats: {
    total: number
    filtered: number
  }
}

const DEFAULT_FILTER_STATE: FilterState = {
  searchTerm: '',
  selectedProviders: [],
  selectedCostTiers: [],
  showMultimodal: false,
  hideExperimental: false
}

export function useFiltering(models: ModelInfo[]): UseFilteringReturn {
  const [filterState, setFilterState] = useState<FilterState>(DEFAULT_FILTER_STATE)
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: 'asc' })

  const availableProviders = useMemo(() => {
    const providers = [...new Set(models.map(model => model.provider))]
    return providers.sort()
  }, [models])

  const updateFilter = useCallback((key: keyof FilterState, value: any) => {
    setFilterState(prev => ({ ...prev, [key]: value }))
  }, [])

  const clearFilters = useCallback(() => {
    setFilterState(DEFAULT_FILTER_STATE)
  }, [])

  const setSort = useCallback((key: keyof ModelInfo | null, direction: 'asc' | 'desc' = 'asc') => {
    setSortConfig(prev => {
      if (prev.key === key) {
        // Toggle direction if same key
        return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' }
      }
      return { key, direction }
    })
  }, [])

  const isExperimentalModel = useCallback((model: ModelInfo) => {
    const experimentalPatterns = [
      /.*-exp-\d{2}-\d{2}$/i,      // Models ending with -exp-MM-DD
      /.*experimental.*$/i,        // Models with "experimental" in the name
      /.*-preview.*$/i,           // Preview models
      /.*-beta.*$/i,              // Beta models
      /.*-alpha.*$/i,             // Alpha models
      /.*-test.*$/i,              // Test models
    ]
    
    return experimentalPatterns.some(pattern => pattern.test(model.id)) ||
           model.name.toLowerCase().includes('experimental') ||
           model.name.toLowerCase().includes('preview') ||
           model.name.toLowerCase().includes('beta') ||
           model.description.toLowerCase().includes('experimental')
  }, [])

  const filteredModels = useMemo(() => {
    let filtered = [...models]

    // Text search
    if (filterState.searchTerm) {
      const searchTerm = filterState.searchTerm.toLowerCase()
      filtered = filtered.filter(model => 
        model.name.toLowerCase().includes(searchTerm) ||
        model.provider.toLowerCase().includes(searchTerm) ||
        model.description.toLowerCase().includes(searchTerm) ||
        model.id.toLowerCase().includes(searchTerm) ||
        model.features?.some(feature => feature.toLowerCase().includes(searchTerm))
      )
    }

    // Provider filter
    if (filterState.selectedProviders.length > 0) {
      filtered = filtered.filter(model => 
        filterState.selectedProviders.includes(model.provider)
      )
    }

    // Cost tier filter
    if (filterState.selectedCostTiers.length > 0) {
      filtered = filtered.filter(model => 
        filterState.selectedCostTiers.includes(model.costTier)
      )
    }

    // Multimodal filter
    if (filterState.showMultimodal) {
      filtered = filtered.filter(model => model.multimodal)
    }

    // Hide experimental models filter
    if (filterState.hideExperimental) {
      filtered = filtered.filter(model => !isExperimentalModel(model))
    }

    // Sorting
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        const aValue = a[sortConfig.key!]
        const bValue = b[sortConfig.key!]
        
        if (aValue === undefined && bValue === undefined) return 0
        if (aValue === undefined) return 1
        if (bValue === undefined) return -1
        
        let comparison = 0
        
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          comparison = aValue.localeCompare(bValue)
        } else if (typeof aValue === 'number' && typeof bValue === 'number') {
          comparison = aValue - bValue
        } else {
          comparison = String(aValue).localeCompare(String(bValue))
        }
        
        return sortConfig.direction === 'desc' ? -comparison : comparison
      })
    }

    return filtered
  }, [models, filterState, sortConfig, isExperimentalModel])

  const filterStats = useMemo(() => ({
    total: models.length,
    filtered: filteredModels.length
  }), [models.length, filteredModels.length])

  return {
    filteredModels,
    filterState,
    sortConfig,
    updateFilter,
    clearFilters,
    setSort,
    availableProviders,
    filterStats
  }
} 