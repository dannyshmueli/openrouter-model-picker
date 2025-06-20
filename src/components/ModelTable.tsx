
import { ChevronUp, ChevronDown, Eye, Zap, Shield, FileText } from 'lucide-react'
import { ModelInfo, SortConfig } from '../types'
import { formatPrice, formatContextLength, truncateText } from '../utils/formatters'

interface ModelTableProps {
  models: ModelInfo[]
  selectedModel?: string
  onModelSelect: (modelId: string) => void
  sortConfig: SortConfig
  onSort: (key: keyof ModelInfo | null, direction?: 'asc' | 'desc') => void
}

export function ModelTable({
  models,
  selectedModel,
  onModelSelect,
  sortConfig,
  onSort
}: ModelTableProps) {
  const getSortIcon = (key: keyof ModelInfo) => {
    if (sortConfig.key !== key) {
      return <ChevronUp style={{ width: '1rem', height: '1rem', color: 'var(--or-text-secondary)' }} />
    }
    return sortConfig.direction === 'asc' 
      ? <ChevronUp style={{ width: '1rem', height: '1rem', color: 'var(--or-primary-color)' }} />
      : <ChevronDown style={{ width: '1rem', height: '1rem', color: 'var(--or-primary-color)' }} />
  }

  const getFeatureIcon = (feature: string) => {
    const iconStyle = { width: '0.75rem', height: '0.75rem' }
    switch (feature.toLowerCase()) {
      case 'vision':
        return <Eye style={iconStyle} />
      case 'fast':
        return <Zap style={iconStyle} />
      case 'moderated':
        return <Shield style={iconStyle} />
      case 'long context':
        return <FileText style={iconStyle} />
      default:
        return null
    }
  }

  const renderFeatureTags = (features?: string[]) => {
    if (!features || features.length === 0) return null

    const visibleFeatures = features.slice(0, 3)
    const hiddenCount = features.length - 3

    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
        {visibleFeatures.map((feature, index) => (
          <span
            key={index}
            className="feature-tag"
          >
            {getFeatureIcon(feature)}
            {feature}
          </span>
        ))}
        {hiddenCount > 0 && (
          <span style={{ 
            padding: '0.25rem 0.5rem', 
            fontSize: '0.75rem', 
            color: 'var(--or-text-secondary)', 
            borderRadius: '0.375rem' 
          }}>
            +{hiddenCount} more
          </span>
        )}
      </div>
    )
  }

  return (
    <div className="table-container">
      <table className="model-table">
        <thead>
          <tr>
            <th>
              <button
                onClick={() => onSort('name')}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: 'var(--or-text)'
                }}
              >
                Model
                {getSortIcon('name')}
              </button>
            </th>
            <th>
              <button
                onClick={() => onSort('provider')}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: 'var(--or-text)'
                }}
              >
                Provider
                {getSortIcon('provider')}
              </button>
            </th>
            <th>
              <button
                onClick={() => onSort('costTier')}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: 'var(--or-text)'
                }}
              >
                Cost
                {getSortIcon('costTier')}
              </button>
            </th>
            <th>
              <button
                onClick={() => onSort('context')}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: 'var(--or-text)'
                }}
              >
                Context
                {getSortIcon('context')}
              </button>
            </th>
            <th>
              <span style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--or-text)' }}>
                Features
              </span>
            </th>
            <th>
              <span style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--or-text)' }}>
                Description
              </span>
            </th>
          </tr>
        </thead>
        <tbody>
          {models.map((model) => (
            <tr
              key={model.id}
              onClick={() => onModelSelect(model.id)}
              className={selectedModel === model.id ? 'selected' : ''}
            >
              <td>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontWeight: '500', color: 'var(--or-text)' }}>{model.name}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--or-text-secondary)' }}>{model.id}</span>
                </div>
              </td>
              <td>
                <span style={{ fontSize: '0.875rem', color: 'var(--or-text)' }}>{model.provider}</span>
              </td>
              <td>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <span
                    className={`cost-tier-${model.costTier}`}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      padding: '0.25rem 0.5rem',
                      fontSize: '0.75rem',
                      fontWeight: '500',
                      borderRadius: '0.375rem',
                      color: 'white',
                      width: 'fit-content'
                    }}
                  >
                    {model.costTier.charAt(0).toUpperCase() + model.costTier.slice(1)}
                  </span>
                  {model.pricing && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--or-text-secondary)' }}>
                      In: {formatPrice(model.pricing.input)} | Out: {formatPrice(model.pricing.output)}
                    </div>
                  )}
                </div>
              </td>
              <td>
                <span style={{ fontSize: '0.875rem', color: 'var(--or-text)' }}>
                  {formatContextLength(model.context)}
                </span>
              </td>
              <td>
                {renderFeatureTags(model.features)}
              </td>
              <td>
                <p style={{ 
                  fontSize: '0.875rem', 
                  color: 'var(--or-text-secondary)', 
                  maxWidth: '20rem',
                  margin: 0
                }}>
                  {truncateText(model.description, 100)}
                </p>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {models.length === 0 && (
        <div className="empty-container">
          <div style={{ fontSize: '1.125rem', fontWeight: '500', marginBottom: '0.5rem', color: 'var(--or-text)' }}>
            No models found
          </div>
          <p style={{ fontSize: '0.875rem', textAlign: 'center', maxWidth: '24rem', margin: 0 }}>
            Try adjusting your search terms or clearing some filters to see more results.
          </p>
        </div>
      )}
    </div>
  )
} 