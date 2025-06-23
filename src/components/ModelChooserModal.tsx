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
  maxHeight = '80vh',
  maxWidth,
  className,
  categorizeByType = false
}: ModelChooserModalProps) {
  const { 
    models, 
    freeModels, 
    paidModels, 
    loading, 
    error, 
    refresh 
  } = useModelData(apiEndpoint, fallbackModels)
  
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
    // CRITICAL: Pass exact model ID without any modification
    onModelChange(modelId)
  }, [onModelChange])

  const handleSelectAndClose = useCallback(() => {
    if (selectedModel) {
      onClose()
    }
  }, [selectedModel, onClose])

  if (!isOpen) return null

  const renderCategorizedModels = () => {
    if (!categorizeByType) {
      return (
        <ModelTable
          models={filteredModels}
          selectedModel={selectedModel}
          onModelSelect={handleModelSelect}
          sortConfig={sortConfig}
          onSort={setSort}
        />
      )
    }

    // Categorize filtered models
    const categorizedFree = filteredModels.filter(m => m.costTier === 'free')
    const categorizedPaid = filteredModels.filter(m => m.costTier !== 'free')

    return (
      <div className="categorized-models">
        {categorizedFree.length > 0 && (
          <div className="model-category">
            <h3 style={{ 
              fontSize: '1rem', 
              fontWeight: '600', 
              margin: '0.75rem 0 0.5rem', 
              color: '#10b981',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              Free Models ({categorizedFree.length})
            </h3>
            <ModelTable
              models={categorizedFree}
              selectedModel={selectedModel}
              onModelSelect={handleModelSelect}
              sortConfig={sortConfig}
              onSort={setSort}
            />
          </div>
        )}

        {categorizedPaid.length > 0 && (
          <div className="model-category">
            <h3 style={{ 
              fontSize: '1rem', 
              fontWeight: '600', 
              margin: '1rem 0 0.5rem', 
              color: 'var(--or-text)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              Paid Models ({categorizedPaid.length})
            </h3>
            <ModelTable
              models={categorizedPaid}
              selectedModel={selectedModel}
              onModelSelect={handleModelSelect}
              sortConfig={sortConfig}
              onSort={setSort}
            />
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={`openrouter-modal ${theme === 'dark' ? 'dark' : ''} ${className || ''}`}>
      {/* Backdrop */}
      <div 
        className="modal-overlay"
        onClick={onClose}
      >
        {/* Modal */}
        <div 
          className="modal-content"
          onClick={(e) => e.stopPropagation()}
          style={{ 
            maxHeight,
            ...(maxWidth && { maxWidth, width: maxWidth })
          }}
        >
          {/* Header */}
          <div className="modal-header">
            <h2 className="modal-title">
              Choose OpenRouter LLM Model
              {!loading && !error && models.length > 0 && (
                <span style={{ 
                  fontWeight: '400', 
                  fontSize: '0.875rem', 
                  color: 'var(--or-text-secondary)',
                  marginLeft: '0.5rem'
                }}>
                  ({models.length} models{freeModels.length > 0 && `: ${freeModels.length} free, ${paidModels.length} paid`})
                </span>
              )}
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
                
                {renderCategorizedModels()}
              </>
            )}
          </div>

          {/* Footer */}
          <div style={{
            padding: '1rem 1.5rem',
            borderTop: '1px solid var(--or-border)',
            backgroundColor: 'rgba(0, 0, 0, 0.02)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              {selectedModel && (
                <div style={{ fontSize: '0.875rem', color: 'var(--or-text-secondary)' }}>
                  Selected: <span style={{ 
                    fontWeight: '500', 
                    color: 'var(--or-text)',
                    fontFamily: 'monospace',
                    fontSize: '0.8rem'
                  }}>{selectedModel}</span>
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