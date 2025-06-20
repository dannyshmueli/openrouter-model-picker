import { useEffect, useCallback } from 'react'
import { X } from 'lucide-react'
import { ModelChooserModalProps } from '../types'
import { useModelData } from '../hooks/useModelData'
import { useFiltering } from '../hooks/useFiltering'
import { FilterBar } from './FilterBar'
import { ModelTable } from './ModelTable'
import { LoadingState, ErrorState } from './LoadingState'

export function ModelChooserModal({
  isOpen,
  onClose,
  selectedModel,
  onModelChange,
  apiEndpoint,
  fallbackModels,
  theme = 'light',
  maxHeight = '80vh'
}: ModelChooserModalProps) {
  const { models, loading, error, refresh } = useModelData(apiEndpoint, fallbackModels)
  const {
    filteredModels,
    filterState,
    sortConfig,
    updateFilter,
    clearFilters,
    setSort,
    availableProviders,
    filterStats
  } = useFiltering(models)

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  const handleModelSelect = useCallback((modelId: string) => {
    onModelChange(modelId)
  }, [onModelChange])

  const handleSelectAndClose = useCallback(() => {
    if (selectedModel) {
      onClose()
    }
  }, [selectedModel, onClose])

  if (!isOpen) return null

  return (
    <div className={`openrouter-modal ${theme === 'dark' ? 'dark' : ''}`}>
      {/* Backdrop */}
      <div 
        className="modal-overlay"
        onClick={onClose}
      >
        {/* Modal */}
        <div 
          className="modal-content"
          onClick={(e) => e.stopPropagation()}
          style={{ maxHeight }}
        >
          {/* Header */}
          <div className="modal-header">
            <h2 className="modal-title">
              Choose AI Model
            </h2>
            
            <button
              onClick={onClose}
              className="modal-close-button"
            >
              <X style={{ width: '1.25rem', height: '1.25rem' }} />
            </button>
          </div>

          {/* Content */}
          <div className="modal-body">
            {loading ? (
              <LoadingState message="Loading available models..." />
            ) : error ? (
              <ErrorState error={error} onRetry={refresh} />
            ) : (
              <>
                <FilterBar
                  filterState={filterState}
                  onFilterChange={updateFilter}
                  onClearFilters={clearFilters}
                  availableProviders={availableProviders}
                  filterStats={filterStats}
                />
                
                <ModelTable
                  models={filteredModels}
                  selectedModel={selectedModel}
                  onModelSelect={handleModelSelect}
                  sortConfig={sortConfig}
                  onSort={setSort}
                />
              </>
            )}
          </div>

          {/* Footer */}
          <div style={{
            padding: '1.5rem',
            borderTop: '1px solid var(--or-border)',
            backgroundColor: 'rgba(0, 0, 0, 0.02)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              {selectedModel && (
                <div style={{ fontSize: '0.875rem', color: 'var(--or-text-secondary)' }}>
                  Selected: <span style={{ fontWeight: '500', color: 'var(--or-text)' }}>{selectedModel}</span>
                </div>
              )}
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <button
                onClick={onClose}
                style={{
                  padding: '0.5rem 1rem',
                  color: 'var(--or-text)',
                  backgroundColor: 'var(--or-background)',
                  border: '1px solid var(--or-border)',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  fontSize: '0.875rem'
                }}
              >
                Cancel
              </button>
              
              <button
                onClick={handleSelectAndClose}
                disabled={!selectedModel}
                style={{
                  padding: '0.5rem 1.5rem',
                  borderRadius: '0.5rem',
                  fontWeight: '500',
                  fontSize: '0.875rem',
                  border: 'none',
                  cursor: selectedModel ? 'pointer' : 'not-allowed',
                  backgroundColor: selectedModel ? 'var(--or-primary-color)' : '#d1d5db',
                  color: selectedModel ? 'white' : '#6b7280'
                }}
              >
                Select Model
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 