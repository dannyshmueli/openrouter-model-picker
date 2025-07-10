import React, { useCallback, useRef } from 'react'
import { Search, Filter, RotateCcw, Info } from 'lucide-react'
import { FilterState } from '../types'
import { getCostTierLabel } from '../utils/formatters'

interface FilterBarProps {
  filterState: FilterState
  onFilterChange: (key: keyof FilterState, value: any) => void
  onClearFilters: () => void
  availableProviders: string[]
  filterStats: { total: number; filtered: number }
}

const COST_TIERS = ['free', 'low', 'medium', 'high']

export function FilterBar({
  filterState,
  onFilterChange,
  onClearFilters,
  availableProviders,
  filterStats
}: FilterBarProps) {
  // Debounced search to avoid excessive filtering
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>()
  
  const debouncedSearch = useCallback((value: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    timeoutRef.current = setTimeout(() => {
      onFilterChange('searchTerm', value)
    }, 300)
  }, [onFilterChange])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    debouncedSearch(e.target.value)
  }

  const handleProviderToggle = (provider: string) => {
    const newProviders = filterState.selectedProviders.includes(provider)
      ? filterState.selectedProviders.filter(p => p !== provider)
      : [...filterState.selectedProviders, provider]
    onFilterChange('selectedProviders', newProviders)
  }

  const handleCostTierToggle = (tier: string) => {
    const newTiers = filterState.selectedCostTiers.includes(tier)
      ? filterState.selectedCostTiers.filter(t => t !== tier)
      : [...filterState.selectedCostTiers, tier]
    onFilterChange('selectedCostTiers', newTiers)
  }

  const hasActiveFilters = filterState.searchTerm || 
    filterState.selectedProviders.length > 0 || 
    filterState.selectedCostTiers.length > 0 || 
    filterState.showMultimodal ||
    filterState.showReasoning ||
    filterState.showStreamCancel ||
    filterState.hideExperimental

  return (
    <div className="filter-bar">
      {/* Search Bar */}
      <div style={{ position: 'relative', marginBottom: '0.75rem' }}>
        <Search style={{ 
          position: 'absolute', 
          left: '0.75rem', 
          top: '50%', 
          transform: 'translateY(-50%)', 
          color: 'var(--or-text-secondary)', 
          width: '1rem', 
          height: '1rem' 
        }} />
        <input
          type="text"
          placeholder="Search models, providers, or features..."
          className="search-input"
          style={{ paddingLeft: '2.5rem' }}
          onChange={handleSearchChange}
          defaultValue={filterState.searchTerm}
        />
      </div>

      {/* Filter Controls */}
      <div className="filter-row" style={{ flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'space-between', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Filter style={{ width: '1rem', height: '1rem', color: 'var(--or-text-secondary)' }} />
            <span style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--or-text)' }}>Filters:</span>
          </div>
          
          {/* Clear Filters */}
          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              className="clear-filters-button"
              style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}
            >
              <RotateCcw style={{ width: '0.75rem', height: '0.75rem' }} />
              Clear all
            </button>
          )}
        </div>

        {/* Provider Filter */}
        <div style={{ width: '100%' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center', marginBottom: '0.25rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--or-text-secondary)', textTransform: 'uppercase', fontWeight: '500', minWidth: 'fit-content' }}>Provider:</span>
          </div>
          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: '0.375rem',
            maxHeight: '50px',
            overflowY: 'auto',
            padding: '0.375rem',
            border: '1px solid var(--or-border)',
            borderRadius: '0.25rem',
            backgroundColor: 'rgba(0, 0, 0, 0.01)'
          }}>
            {availableProviders.map(provider => (
              <button
                key={provider}
                onClick={() => handleProviderToggle(provider)}
                className={`filter-button ${filterState.selectedProviders.includes(provider) ? 'active' : ''}`}
                style={{ fontSize: '0.7rem', padding: '0.25rem 0.5rem' }}
              >
                {provider}
              </button>
            ))}
          </div>
        </div>

        {/* Cost Tier Filter */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--or-text-secondary)', textTransform: 'uppercase', fontWeight: '500' }}>Cost:</span>
          {COST_TIERS.map(tier => (
            <button
              key={tier}
              onClick={() => handleCostTierToggle(tier)}
              className={`filter-button ${filterState.selectedCostTiers.includes(tier) ? 'active' : ''}`}
              style={{ fontSize: '0.7rem', padding: '0.25rem 0.5rem' }}
            >
              {getCostTierLabel(tier)}
            </button>
          ))}
        </div>

        {/* Model Type Filters */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
          {/* Multimodal Filter */}
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={filterState.showMultimodal}
              onChange={(e) => onFilterChange('showMultimodal', e.target.checked)}
              style={{ width: '0.875rem', height: '0.875rem' }}
            />
            <span style={{ fontSize: '0.8rem', color: 'var(--or-text)' }}>Multimodal only</span>
          </label>

          {/* Reasoning Filter with Warning */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={filterState.showReasoning}
                onChange={(e) => onFilterChange('showReasoning', e.target.checked)}
                style={{ width: '0.875rem', height: '0.875rem' }}
              />
              <span style={{ fontSize: '0.8rem', color: 'var(--or-text)' }}>Reasoning only</span>
            </label>
            <div 
              style={{ 
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                cursor: 'help'
              }}
              title="⚠️ Reasoning detection uses pattern matching for known models (o1, DeepSeek R1, Gemini Thinking, etc.). New reasoning models may not be detected. OpenRouter doesn't provide an official reasoning capability field."
            >
              <Info style={{ 
                width: '0.75rem', 
                height: '0.75rem', 
                color: 'var(--or-text-secondary)',
                opacity: 0.7
              }} />
            </div>
          </div>

          {/* Stream Cancel Filter with Warning */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={filterState.showStreamCancel}
                onChange={(e) => onFilterChange('showStreamCancel', e.target.checked)}
                style={{ width: '0.875rem', height: '0.875rem' }}
              />
              <span style={{ fontSize: '0.8rem', color: 'var(--or-text)' }}>Stream cancel only</span>
            </label>
            <div 
              style={{ 
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                cursor: 'help'
              }}
              title="⚠️ Stream cancellation stops model processing and billing immediately when you abort a request. Provider-dependent: OpenAI, Anthropic, DeepSeek support it; Google, Groq, HuggingFace don't. Critical for cost control in streaming scenarios."
            >
              <Info style={{ 
                width: '0.75rem', 
                height: '0.75rem', 
                color: 'var(--or-text-secondary)',
                opacity: 0.7
              }} />
            </div>
          </div>

          {/* Hide Experimental Filter */}
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={filterState.hideExperimental}
              onChange={(e) => onFilterChange('hideExperimental', e.target.checked)}
              style={{ width: '0.875rem', height: '0.875rem' }}
            />
            <span style={{ fontSize: '0.8rem', color: 'var(--or-text)' }}>Hide experimental</span>
          </label>
        </div>
      </div>

      {/* Results Counter */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        fontSize: '0.8rem', 
        color: 'var(--or-text-secondary)',
        marginTop: '0.5rem',
        paddingTop: '0.5rem',
        borderTop: '1px solid var(--or-border)'
      }}>
        <span className="results-count">
          Showing {filterStats.filtered} of {filterStats.total} models
        </span>
        {filterStats.filtered < filterStats.total && (
          <span style={{ color: 'var(--or-primary-color)', marginLeft: '1rem' }}>
            {filterStats.total - filterStats.filtered} hidden by filters
          </span>
        )}
      </div>
    </div>
  )
} 