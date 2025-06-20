import React, { useCallback, useRef } from 'react'
import { Search, Filter, RotateCcw } from 'lucide-react'
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
    filterState.showMultimodal

  return (
    <div className="filter-bar">
      {/* Search Bar */}
      <div style={{ position: 'relative', marginBottom: '1rem' }}>
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
      <div className="filter-row">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Filter style={{ width: '1rem', height: '1rem', color: 'var(--or-text-secondary)' }} />
          <span style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--or-text)' }}>Filters:</span>
        </div>

        {/* Provider Filter */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--or-text-secondary)', textTransform: 'uppercase', fontWeight: '500' }}>Provider:</span>
          {availableProviders.slice(0, 6).map(provider => (
            <button
              key={provider}
              onClick={() => handleProviderToggle(provider)}
              className={`filter-button ${filterState.selectedProviders.includes(provider) ? 'active' : ''}`}
              style={{ fontSize: '0.75rem' }}
            >
              {provider}
            </button>
          ))}
          {availableProviders.length > 6 && (
            <span style={{ fontSize: '0.75rem', color: 'var(--or-text-secondary)' }}>
              +{availableProviders.length - 6} more
            </span>
          )}
        </div>

        {/* Cost Tier Filter */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--or-text-secondary)', textTransform: 'uppercase', fontWeight: '500' }}>Cost:</span>
          {COST_TIERS.map(tier => (
            <button
              key={tier}
              onClick={() => handleCostTierToggle(tier)}
              className={`filter-button ${filterState.selectedCostTiers.includes(tier) ? 'active' : ''}`}
              style={{ fontSize: '0.75rem' }}
            >
              {getCostTierLabel(tier)}
            </button>
          ))}
        </div>

        {/* Multimodal Filter */}
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={filterState.showMultimodal}
            onChange={(e) => onFilterChange('showMultimodal', e.target.checked)}
            style={{ width: '1rem', height: '1rem' }}
          />
          <span style={{ fontSize: '0.875rem', color: 'var(--or-text)' }}>Multimodal only</span>
        </label>

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

      {/* Results Counter */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        fontSize: '0.875rem', 
        color: 'var(--or-text-secondary)',
        marginTop: '1rem'
      }}>
        <span className="results-count">
          Showing {filterStats.filtered} of {filterStats.total} models
        </span>
        {hasActiveFilters && (
          <span style={{ color: 'var(--or-primary-color)' }}>
            {filterStats.total - filterStats.filtered} models filtered out
          </span>
        )}
      </div>
    </div>
  )
} 