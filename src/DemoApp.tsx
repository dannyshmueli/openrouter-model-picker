import React, { useState } from 'react'
import { ModelChooserModal, useModelData, ModelInfo } from './index'
import './styles/modal.css'

// Add API Example Modal Component
interface ApiExampleModalProps {
  isOpen: boolean
  onClose: () => void
  model: ModelInfo
  apiKey: string
}

function ApiExampleModal({ isOpen, onClose, model, apiKey }: ApiExampleModalProps) {
  const [activeTab, setActiveTab] = useState<'basic' | 'reasoning' | 'streaming'>('basic')

  if (!isOpen) return null

  const baseExample = {
    method: 'POST',
    url: 'https://openrouter.ai/api/v1/chat/completions',
    headers: {
      'Authorization': `Bearer ${apiKey || 'YOUR_OPENROUTER_API_KEY'}`,
      'Content-Type': 'application/json'
    },
    body: {
      model: model.id,
      messages: [
        { role: 'user', content: 'Hello, how are you?' }
      ],
      stream: model.reasoning || false
    }
  }

  const reasoningExample = {
    ...baseExample,
    body: {
      ...baseExample.body,
      messages: [
        { role: 'user', content: 'What\'s bigger, 9.9 or 9.11? Explain your reasoning step by step.' }
      ],
      stream: true,
      reasoning: {
        // One of the following (not both):
        effort: 'high',        // Can be "high", "medium", or "low" (OpenAI-style)
        // max_tokens: 2000,   // Specific token limit (Anthropic-style)
        
        // Optional parameters:
        exclude: false,        // Set to true to exclude reasoning tokens from response
        enabled: true          // Default: inferred from `effort` or `max_tokens`
      }
    }
  }

  const streamingExample = {
    ...baseExample,
    body: {
      ...baseExample.body,
      messages: [
        { role: 'user', content: 'Write a detailed analysis of renewable energy trends.' }
      ],
      stream: true,
      ...(model.reasoning && {
        reasoning: {
          max_tokens: 4000,     // Anthropic-style token limit
          exclude: false,       // Include reasoning in streamed response
          enabled: true         // Default: inferred from max_tokens
        }
      })
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      // Could add a toast notification here
    })
  }

  const renderExample = (example: any, title: string, description: string) => (
    <div style={{ marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
        <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '600' }}>{title}</h4>
        <button
          onClick={() => copyToClipboard(JSON.stringify(example, null, 2))}
          style={{
            padding: '0.25rem 0.5rem',
            fontSize: '0.75rem',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '0.25rem',
            cursor: 'pointer'
          }}
        >
          📋 Copy
        </button>
      </div>
      <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0 0 0.75rem 0' }}>{description}</p>
      <pre style={{
        backgroundColor: '#f8fafc',
        border: '1px solid #e2e8f0',
        borderRadius: '0.5rem',
        padding: '1rem',
        fontSize: '0.8rem',
        overflow: 'auto',
        maxHeight: '300px',
        fontFamily: 'Monaco, Consolas, "Liberation Mono", "Courier New", monospace'
      }}>
        <code>{JSON.stringify(example, null, 2)}</code>
      </pre>
    </div>
  )

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '0.75rem',
        width: '100%',
        maxWidth: '900px',
        maxHeight: '90vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          padding: '1.5rem',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '600' }}>
              API Examples for {model.name}
            </h3>
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.875rem', color: '#6b7280' }}>
              Ready-to-use examples with {model.reasoning ? 'reasoning tokens' : 'standard configuration'}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              padding: '0.5rem',
              backgroundColor: 'transparent',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              borderRadius: '0.25rem'
            }}
          >
            ×
          </button>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid #e5e7eb',
          backgroundColor: '#f9fafb'
        }}>
          {['basic', 'reasoning', 'streaming'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: activeTab === tab ? 'white' : 'transparent',
                border: 'none',
                borderBottom: activeTab === tab ? '2px solid #3b82f6' : '2px solid transparent',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: activeTab === tab ? '600' : '400',
                color: activeTab === tab ? '#3b82f6' : '#6b7280'
              }}
            >
              {tab === 'basic' && '📝 Basic'}
              {tab === 'reasoning' && '🧠 Reasoning'}
              {tab === 'streaming' && '🌊 Streaming'}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{
          padding: '1.5rem',
          overflow: 'auto',
          flex: 1
        }}>
          {activeTab === 'basic' && renderExample(
            baseExample,
            'Basic API Call',
            `Simple API call to ${model.name}. ${model.reasoning ? 'Streaming enabled automatically for reasoning models.' : 'Standard configuration.'}`
          )}

          {activeTab === 'reasoning' && (
            <div>
              {model.reasoning ? (
                <>
                  {renderExample(
                    reasoningExample,
                    'Reasoning with Effort Level',
                    'Uses reasoning.effort parameter (high/medium/low) - supported by OpenAI o-series and Grok models.'
                  )}
                  
                  {renderExample(
                    {
                      ...reasoningExample,
                      body: {
                        ...reasoningExample.body,
                        reasoning: {
                          // Use max_tokens instead of effort (not both):
                          max_tokens: 2000,   // Specific token limit (Anthropic-style)
                          
                          // Optional parameters:
                          exclude: false,     // Set to true to exclude reasoning from response
                          enabled: true       // Default: inferred from max_tokens
                        }
                      }
                    },
                    'Reasoning with Max Tokens',
                    'Uses reasoning.max_tokens parameter - supported by Anthropic and Gemini thinking models.'
                  )}

                  {renderExample(
                    {
                      ...reasoningExample,
                      body: {
                        ...reasoningExample.body,
                        reasoning: {
                          effort: 'medium',     // Can be "high", "medium", or "low"
                          exclude: true,        // Hide reasoning from response
                          enabled: true         // Default: inferred from effort
                        }
                      }
                    },
                    'Hidden Reasoning',
                    'Model uses reasoning internally but excludes it from the response (reasoning.exclude: true).'
                  )}

                  {renderExample(
                    {
                      ...reasoningExample,
                      body: {
                        ...reasoningExample.body,
                        reasoning: {
                          max_tokens: 1500,     // Anthropic-style token limit
                          exclude: false,       // Include reasoning in response
                          enabled: true         // Explicitly enable reasoning
                        }
                      }
                    },
                    'Complete Reasoning Configuration',
                    'Shows all available parameters with explicit settings for maximum control.'
                  )}

                  <div style={{
                    backgroundColor: '#fef3c7',
                    border: '1px solid #f59e0b',
                    borderRadius: '0.5rem',
                    padding: '1rem',
                    marginTop: '1rem'
                  }}>
                    <h5 style={{ margin: '0 0 0.5rem', color: '#92400e' }}>💡 Reasoning Token Configuration</h5>
                    <ul style={{ margin: 0, paddingLeft: '1.25rem', color: '#92400e', fontSize: '0.875rem' }}>
                      <li><strong>Effort vs Max Tokens:</strong> Use one or the other, not both</li>
                      <li><strong>effort:</strong> "high"/"medium"/"low" (OpenAI o-series, Grok)</li>
                      <li><strong>max_tokens:</strong> Specific token limit (Anthropic, Gemini thinking)</li>
                      <li><strong>exclude:</strong> false (default) = show reasoning, true = hide it</li>
                      <li><strong>enabled:</strong> Auto-inferred from effort/max_tokens, can override</li>
                      <li><strong>Billing:</strong> Reasoning tokens are charged as output tokens</li>
                      <li><strong>Streaming:</strong> Use stream: true to see thinking process live</li>
                    </ul>
                  </div>
                </>
              ) : (
                <div style={{
                  textAlign: 'center',
                  padding: '2rem',
                  color: '#6b7280'
                }}>
                  <h4>This model doesn't support reasoning tokens</h4>
                  <p>Select a reasoning model (🧠) to see reasoning-specific examples.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'streaming' && (
            <div>
              {renderExample(
                streamingExample,
                'Streaming Response',
                `Streaming configuration${model.streamCancel ? ' with cancellation support' : ' (no cancellation support)'}.`
              )}

              <div style={{
                backgroundColor: model.streamCancel ? '#ecfdf5' : '#fef2f2',
                border: `1px solid ${model.streamCancel ? '#10b981' : '#ef4444'}`,
                borderRadius: '0.5rem',
                padding: '1rem',
                marginTop: '1rem'
              }}>
                <h5 style={{ margin: '0 0 0.5rem', color: model.streamCancel ? '#047857' : '#dc2626' }}>
                  {model.streamCancel ? '✅ Stream Cancellation Supported' : '⚠️ Stream Cancellation NOT Supported'}
                </h5>
                <p style={{ margin: 0, color: model.streamCancel ? '#047857' : '#dc2626', fontSize: '0.875rem' }}>
                  {model.streamCancel 
                    ? 'You can safely abort streaming requests to control costs. The model will stop processing immediately.'
                    : 'This provider does not support stream cancellation. You will be charged for the complete response even if you abort the request.'
                  }
                </p>
              </div>

              {model.reasoning && (
                <div style={{ marginTop: '1.5rem' }}>
                  {renderExample(
                    {
                      method: 'POST',
                      url: 'https://openrouter.ai/api/v1/chat/completions',
                      headers: baseExample.headers,
                      body: {
                        model: model.id,
                        messages: [
                          { role: 'user', content: 'Solve this math problem step by step: What is 15% of 240?' }
                        ],
                        stream: true,
                        reasoning: {
                          effort: 'high'
                        }
                      }
                    },
                    'Streaming + Reasoning',
                    'Combines streaming with reasoning tokens for real-time thinking process visibility.'
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '1rem 1.5rem',
          borderTop: '1px solid #e5e7eb',
          backgroundColor: '#f9fafb',
          fontSize: '0.75rem',
          color: '#6b7280'
        }}>
          📚 Learn more: <a href="https://openrouter.ai/docs/use-cases/reasoning-tokens" target="_blank" rel="noopener noreferrer" style={{ color: '#3b82f6' }}>OpenRouter Reasoning Tokens Documentation</a>
        </div>
      </div>
    </div>
  )
}

export function DemoApp() {
  const [selectedModel, setSelectedModel] = useState<string>('')
  const [selectedModelInfo, setSelectedModelInfo] = useState<ModelInfo | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [apiKey, setApiKey] = useState('')
  const [showApiKeyInput, setShowApiKeyInput] = useState(false)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<any>(null)
  const [showApiModal, setShowApiModal] = useState(false)
  
  const { models, loading, error, refresh } = useModelData()

  const handleTestCall = async () => {
    alert('Test functionality removed. Use the "View API Examples" button instead for comprehensive API usage examples.')
  }

  const handleApiKeySubmit = () => {
    if (apiKey.trim()) {
      setShowApiKeyInput(false)
      handleTestCall()
    }
  }

  const handleExampleApiCall = () => {
    if (!selectedModel || !selectedModelInfo) return
    setShowApiModal(true)
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
        
        {selectedModel ? (() => {
          // Use the selected model info from the enhanced callback
          const model = selectedModelInfo || models.find(m => m.id === selectedModel)
          
          return (
            <div>
              <div style={{ 
                fontFamily: 'monospace', 
                fontSize: '0.875rem', 
                padding: '0.5rem',
                backgroundColor: '#f3f4f6',
                borderRadius: '0.375rem',
                marginBottom: '0.75rem'
              }}>
                {selectedModel}
              </div>
              
              {model && (
                <div style={{ 
                  marginBottom: '1rem',
                  padding: '0.75rem',
                  backgroundColor: '#f8fafc',
                  borderRadius: '0.375rem',
                  border: '1px solid #e2e8f0'
                }}>
                  <div style={{ 
                    fontSize: '0.875rem', 
                    fontWeight: '500', 
                    marginBottom: '0.5rem',
                    color: '#374151'
                  }}>
                    {model.name} by {model.provider}
                  </div>
                  
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                    {model.reasoning && (
                      <span style={{
                        padding: '0.25rem 0.5rem',
                        fontSize: '0.75rem',
                        backgroundColor: '#8b5cf6',
                        color: 'white',
                        borderRadius: '0.375rem',
                        fontWeight: '500',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem'
                      }}>
                        🧠 Reasoning Support
                      </span>
                    )}
                    {model.multimodal && (
                      <span style={{
                        padding: '0.25rem 0.5rem',
                        fontSize: '0.75rem',
                        backgroundColor: '#10b981',
                        color: 'white',
                        borderRadius: '0.375rem',
                        fontWeight: '500',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem'
                      }}>
                        👁 Vision Support
                      </span>
                    )}
                    {model.streamCancel && (
                      <span style={{
                        padding: '0.25rem 0.5rem',
                        fontSize: '0.75rem',
                        backgroundColor: '#f59e0b',
                        color: 'white',
                        borderRadius: '0.375rem',
                        fontWeight: '500',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem'
                      }}>
                        ⏹️ Stream Cancel
                      </span>
                    )}
                    <span style={{
                      padding: '0.25rem 0.5rem',
                      fontSize: '0.75rem',
                      backgroundColor: model.costTier === 'free' ? '#10b981' : 
                                     model.costTier === 'low' ? '#3b82f6' :
                                     model.costTier === 'medium' ? '#f59e0b' : '#ef4444',
                      color: 'white',
                      borderRadius: '0.375rem',
                      fontWeight: '500'
                    }}>
                      {model.costTier.charAt(0).toUpperCase() + model.costTier.slice(1)} Cost
                    </span>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    {model.reasoning && (
                      <div style={{ 
                        fontSize: '0.75rem', 
                        color: '#6b7280',
                        fontStyle: 'italic'
                      }}>
                        ℹ️ This model supports reasoning tokens for step-by-step thinking
                      </div>
                    )}
                    {model.streamCancel && (
                      <div style={{ 
                        fontSize: '0.75rem', 
                        color: '#6b7280',
                        fontStyle: 'italic'
                      }}>
                        ⏹️ This model supports stream cancellation for cost control
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              <p style={{ color: '#666', fontSize: '0.875rem', marginBottom: '1rem' }}>
                ✅ This exact model ID will be used in API calls (no suffixes added)
              </p>
            </div>
          )
        })() : (
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
                disabled={!selectedModelInfo}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: selectedModelInfo ? '#6b7280' : '#9ca3af',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: selectedModelInfo ? 'pointer' : 'not-allowed',
                  fontWeight: '500'
                }}
              >
                {selectedModelInfo?.reasoning ? '🧠 View API Examples (Reasoning)' : '📝 View API Examples'}
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
          <li>✅ <strong>🧠 Reasoning model detection</strong> - Automatically detects and highlights o1, DeepSeek R1, and other thinking models</li>
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
        onModelSelect={setSelectedModelInfo}
        categorizeByType={true}
        maxHeight="90vh"
        maxWidth="1200px"
      />

      {selectedModelInfo && (
        <ApiExampleModal
          isOpen={showApiModal}
          onClose={() => setShowApiModal(false)}
          model={selectedModelInfo}
          apiKey={apiKey}
        />
      )}
    </div>
  )
} 