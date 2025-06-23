import { useState } from 'react'
import { ModelChooserModal } from './components/ModelChooserModal'
import { useModelData } from './hooks/useModelData'

export function DemoApp() {
  const [selectedModel, setSelectedModel] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [apiKey, setApiKey] = useState('')
  const [showApiKeyInput, setShowApiKeyInput] = useState(false)
  const [testResult, setTestResult] = useState<{
    success: boolean
    response?: string
    error?: string
    usage?: {
      prompt_tokens: number
      completion_tokens: number
      total_tokens: number
    }
  } | null>(null)
  const [testing, setTesting] = useState(false)

  const { testModel } = useModelData()

  const handleTestCall = async () => {
    if (!selectedModel) {
      alert('Please select a model first.')
      return
    }

    if (!apiKey) {
      setShowApiKeyInput(true)
      return
    }

    setTesting(true)
    setTestResult(null)

    try {
      const result = await testModel(selectedModel, apiKey, "Hello! Please respond with a brief greeting.")
      setTestResult(result)
    } catch (error) {
      setTestResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      })
    } finally {
      setTesting(false)
    }
  }

  const handleApiKeySubmit = () => {
    if (apiKey.trim()) {
      setShowApiKeyInput(false)
      handleTestCall()
    }
  }

  const handleExampleApiCall = () => {
    if (!selectedModel) return
    
    // Example API call structure
    const exampleCall = {
      method: 'POST',
      url: 'https://openrouter.ai/api/v1/chat/completions',
      headers: {
        'Authorization': `Bearer ${apiKey || 'YOUR_OPENROUTER_API_KEY'}`,
        'Content-Type': 'application/json'
      },
      body: {
        model: selectedModel, // CRITICAL: Use exact model ID
        messages: [
          { role: 'user', content: 'Hello, how are you?' }
        ]
      }
    }
    
    alert(`Example API call structure:\n\n${JSON.stringify(exampleCall, null, 2)}`)
    console.log('Example API call structure:', exampleCall)
  }

  return (
    <div style={{ 
      padding: '2rem', 
      maxWidth: '800px', 
      margin: '0 auto',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ marginBottom: '1rem' }}>OpenRouter Model Picker Demo</h1>
        <p style={{ color: '#666', marginBottom: '2rem' }}>
          This demo shows the improved model picker with live data fetching, 
          proper model filtering, and exact model ID usage. The API key is only used for testing actual model calls.
        </p>
      </div>

      {/* Current Selection */}
      <div style={{ 
        padding: '1.5rem', 
        border: '1px solid #e5e7eb', 
        borderRadius: '0.5rem',
        marginBottom: '2rem' 
      }}>
        <h3 style={{ marginBottom: '1rem', fontSize: '1.125rem' }}>Current Selection</h3>
        
        {selectedModel ? (
          <div>
            <div style={{ 
              fontFamily: 'monospace', 
              fontSize: '0.875rem', 
              padding: '0.5rem',
              backgroundColor: '#f3f4f6',
              borderRadius: '0.375rem',
              marginBottom: '1rem'
            }}>
              {selectedModel}
            </div>
            <p style={{ color: '#666', fontSize: '0.875rem', marginBottom: '1rem' }}>
              ✅ This exact model ID will be used in API calls (no suffixes added)
            </p>
          </div>
        ) : (
          <p style={{ color: '#666', fontSize: '0.875rem' }}>
            No model selected
          </p>
        )}

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setIsModalOpen(true)}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            Choose Model
          </button>
          
          {selectedModel && (
            <>
              <button
                onClick={handleTestCall}
                disabled={testing}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: testing ? '#9ca3af' : '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: testing ? 'not-allowed' : 'pointer',
                  fontWeight: '500'
                }}
              >
                {testing ? 'Testing...' : 'Test Model'}
              </button>
              
              <button
                onClick={handleExampleApiCall}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#6b7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                View API Structure
              </button>
            </>
          )}
        </div>
      </div>

      {/* API Key Input - Only shown when needed */}
      {showApiKeyInput && (
        <div style={{ 
          padding: '1.5rem', 
          border: '1px solid #f59e0b', 
          borderRadius: '0.5rem',
          marginBottom: '2rem',
          backgroundColor: '#fffbeb'
        }}>
          <h3 style={{ marginBottom: '1rem', fontSize: '1.125rem', color: '#92400e' }}>
            API Key Required
          </h3>
          
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
              OpenRouter API Key:
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your OpenRouter API key..."
              onKeyDown={(e) => e.key === 'Enter' && handleApiKeySubmit()}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                fontSize: '0.875rem'
              }}
              autoFocus
            />
            <small style={{ color: '#6b7280', fontSize: '0.75rem' }}>
              💡 Your API key is needed to make actual test calls to the OpenRouter API
            </small>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={handleApiKeySubmit}
              disabled={!apiKey.trim()}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: apiKey.trim() ? '#10b981' : '#9ca3af',
                color: 'white',
                border: 'none',
                borderRadius: '0.375rem',
                cursor: apiKey.trim() ? 'pointer' : 'not-allowed',
                fontWeight: '500',
                fontSize: '0.875rem'
              }}
            >
              Test Model
            </button>
            <button
              onClick={() => setShowApiKeyInput(false)}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#6b7280',
                color: 'white',
                border: 'none',
                borderRadius: '0.375rem',
                cursor: 'pointer',
                fontWeight: '500',
                fontSize: '0.875rem'
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Test Results */}
      {testResult && (
        <div style={{ 
          padding: '1.5rem', 
          border: `1px solid ${testResult.success ? '#10b981' : '#ef4444'}`, 
          borderRadius: '0.5rem',
          marginBottom: '2rem',
          backgroundColor: testResult.success ? '#f0fdf4' : '#fef2f2'
        }}>
          <h3 style={{ 
            marginBottom: '1rem', 
            fontSize: '1.125rem',
            color: testResult.success ? '#065f46' : '#991b1b'
          }}>
            Test Result
          </h3>
          
          {testResult.success ? (
            <div>
              <div style={{ 
                padding: '0.75rem',
                backgroundColor: 'white',
                borderRadius: '0.375rem',
                marginBottom: '1rem',
                border: '1px solid #d1fae5'
              }}>
                <strong>Response:</strong> {testResult.response}
              </div>
              {testResult.usage && (
                <div style={{ fontSize: '0.875rem', color: '#065f46' }}>
                  <strong>Usage:</strong> {testResult.usage.prompt_tokens} prompt + {testResult.usage.completion_tokens} completion = {testResult.usage.total_tokens} total tokens
                </div>
              )}
            </div>
          ) : (
            <div style={{ 
              padding: '0.75rem',
              backgroundColor: 'white',
              borderRadius: '0.375rem',
              border: '1px solid #fecaca',
              color: '#991b1b'
            }}>
              <strong>Error:</strong> {testResult.error}
            </div>
          )}
        </div>
      )}

      {/* Features Section */}
      <div style={{ 
        padding: '1.5rem', 
        border: '1px solid #e5e7eb', 
        borderRadius: '0.5rem',
        backgroundColor: '#f0f9ff' 
      }}>
        <h3 style={{ marginBottom: '1rem', fontSize: '1.125rem' }}>Key Features</h3>
        <ul style={{ paddingLeft: '1.25rem', color: '#666' }}>
          <li>✅ Live model fetching from OpenRouter API (no API key needed)</li>
          <li>✅ <strong>Enhanced deprecated model filtering</strong> - Removes models that cause 404 errors</li>
          <li>✅ Free vs paid model categorization</li>
          <li>✅ Exact model ID usage (no ":free" suffixes)</li>
          <li>✅ Real model testing with API key (actual completions)</li>
          <li>✅ Improved error handling and fallback models</li>
          <li>✅ Enhanced UI with model statistics</li>
        </ul>
        
        <div style={{ 
          marginTop: '1rem', 
          padding: '0.75rem', 
          backgroundColor: '#dbeafe',
          borderRadius: '0.375rem',
          fontSize: '0.875rem',
          color: '#1e40af'
        }}>
          <strong>💡 Tip:</strong> Check the browser console to see filtering stats - 
          broken models are pre-filtered out, experimental models can be hidden via checkbox.
        </div>
      </div>

      <ModelChooserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedModel={selectedModel}
        onModelChange={setSelectedModel}
        categorizeByType={true}
        maxHeight="90vh"
        maxWidth="1200px"
      />
    </div>
  )
} 