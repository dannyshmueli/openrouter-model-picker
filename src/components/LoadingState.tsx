
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react'

interface LoadingStateProps {
  message?: string
}

export function LoadingState({ message = 'Loading models...' }: LoadingStateProps) {
  return (
    <div className="loading-container">
      <Loader2 className="loading-spinner spinner" style={{ width: '2rem', height: '2rem' }} />
      <p style={{ color: 'var(--or-text-secondary)', textAlign: 'center' }}>{message}</p>
    </div>
  )
}

interface ErrorStateProps {
  error: string
  onRetry?: () => void
}

export function ErrorState({ error, onRetry }: ErrorStateProps) {
  return (
    <div className="error-container">
      <AlertCircle style={{ width: '2rem', height: '2rem', color: '#ef4444', marginBottom: '1rem' }} />
      <h3 style={{ 
        fontSize: '1.125rem', 
        fontWeight: '500', 
        color: 'var(--or-text)', 
        marginBottom: '0.5rem' 
      }}>
        Failed to load models
      </h3>
      <p className="error-message" style={{ textAlign: 'center', maxWidth: '24rem' }}>
        {error}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="retry-button"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <RefreshCw style={{ width: '1rem', height: '1rem' }} />
          Try Again
        </button>
      )}
    </div>
  )
}

interface EmptyStateProps {
  onClearFilters?: () => void
}

export function EmptyState({ onClearFilters }: EmptyStateProps) {
  return (
    <div className="empty-container">
      <div style={{ fontSize: '3.75rem', marginBottom: '1rem' }}>🔍</div>
      <h3 style={{ 
        fontSize: '1.125rem', 
        fontWeight: '500', 
        color: 'var(--or-text)', 
        marginBottom: '0.5rem' 
      }}>
        No models match your criteria
      </h3>
      <p style={{ 
        color: 'var(--or-text-secondary)', 
        textAlign: 'center', 
        maxWidth: '24rem', 
        marginBottom: '1rem' 
      }}>
        Try adjusting your search terms or clearing some filters to see more results.
      </p>
      {onClearFilters && (
        <button
          onClick={onClearFilters}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: 'rgba(0, 0, 0, 0.05)',
            color: 'var(--or-text)',
            border: 'none',
            borderRadius: '0.5rem',
            cursor: 'pointer',
            fontSize: '0.875rem'
          }}
        >
          Clear all filters
        </button>
      )}
    </div>
  )
} 