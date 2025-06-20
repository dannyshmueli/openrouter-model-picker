import { useState, useEffect } from 'react'
import { ModelChooserModal } from './components/ModelChooserModal'

function DemoApp() {
  const [selectedModel, setSelectedModel] = useState('openai/gpt-4o-mini')
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Console log whenever the selected model changes
  useEffect(() => {
    if (selectedModel) {
      console.log('🤖 Selected model:', selectedModel)
    }
  }, [selectedModel])

  return (
    <div style={{ 
      padding: '2rem',
      maxWidth: '1200px',
      margin: '0 auto',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <header style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 style={{ 
          fontSize: '2.5rem',
          fontWeight: 'bold',
          color: '#111827',
          marginBottom: '1rem'
        }}>
          OpenRouter Model Picker
        </h1>
        <p style={{ fontSize: '1.25rem', color: '#6b7280' }}>
          A React component for browsing and selecting AI models from OpenRouter
        </p>
      </header>

      <div style={{
        background: 'white',
        borderRadius: '0.75rem',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        padding: '1.5rem',
        marginBottom: '2rem'
      }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem' }}>
          Demo
        </h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ 
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '0.5rem'
            }}>
              Currently Selected Model:
            </label>
            <div style={{
              padding: '0.75rem',
              backgroundColor: '#f3f4f6',
              borderRadius: '0.5rem',
              fontFamily: 'monospace',
              fontSize: '0.875rem'
            }}>
              {selectedModel || 'None selected'}
            </div>
          </div>

          <div>
            <button
              onClick={() => setIsModalOpen(true)}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: '500'
              }}
            >
              🤖 Choose Model
            </button>
          </div>
        </div>
      </div>

      <div style={{
        background: 'white',
        borderRadius: '0.75rem',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        padding: '1.5rem'
      }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
          How to Use
        </h3>
        <div style={{ color: '#4b5563', lineHeight: '1.6' }}>
          <ol style={{ paddingLeft: '1.5rem' }}>
            <li>Click the "🤖 Choose Model" button to open the model picker</li>
            <li>Browse available models, filter by provider or cost tier</li>
            <li>Search for specific models using the search bar</li>
            <li>Click on a model to select it</li>
            <li>Click "Select Model" to confirm your choice</li>
            <li>Use the returned model ID in your OpenRouter API calls</li>
          </ol>
        </div>
      </div>

      <ModelChooserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedModel={selectedModel}
        onModelChange={setSelectedModel}
      />
    </div>
  )
}

export default DemoApp 