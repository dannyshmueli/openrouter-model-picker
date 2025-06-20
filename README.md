# OpenRouter Model Picker

A third-party React component for browsing, filtering, and selecting AI models from the [OpenRouter API](https://openrouter.ai/docs/api-reference/list-available-models). This is an unofficial tool created by a user of OpenRouter's service - not affiliated with or endorsed by OpenRouter.

![OpenRouter Model Picker Demo](https://via.placeholder.com/800x400/3b82f6/ffffff?text=OpenRouter+Model+Picker)

## 🎯 Why This Exists

As a developer building LLM-powered applications, I found myself constantly switching between the OpenRouter website and my code to explore available models, compare pricing, and check capabilities. This became especially tedious when:

- **Building prototypes** where I needed to quickly test different models
- **Optimizing costs** by comparing pricing across providers and model tiers  
- **Matching capabilities** to specific use cases (vision, context length, etc.)

Rather than hardcoding a few model options, this component brings the entire OpenRouter model catalog directly into your application. So you can make informed decisions about model selection based on real-time pricing, capabilities, and performance characteristics - all within your app's interface.

**Perfect for:**
- Developer tools and AI playgrounds  
- Cost optimization dashboards
- Multi-model AI applications
- Educational tools teaching about different LLMs

## ✨ Features

- 🔍 **Smart Filtering**: Real-time search across model names, providers, descriptions, and features
- 💰 **Cost Awareness**: Color-coded pricing tiers and detailed cost breakdowns
- 📊 **Performance Metrics**: Optional analytics tracking for response times and usage patterns
- ♿ **Accessibility**: Full keyboard navigation, screen reader support, ARIA compliance
- 📱 **Responsive**: Optimized for desktop, tablet, and mobile devices
- 🎨 **Customizable**: Light/dark themes, custom API endpoints, fallback data
- ⚡ **Performance**: Virtual scrolling, debounced search, memoized operations
- 🔒 **Type Safe**: Full TypeScript support with comprehensive type definitions

## 🚀 Installation

```bash
npm install openrouter-model-picker
# or
yarn add openrouter-model-picker
# or
pnpm add openrouter-model-picker
```

### Installing from GitHub (Latest)

```bash
npm install dannyshmueli/openrouter-model-picker
```

**Note**: GitHub installations will automatically build the package via postinstall script.

## 📦 Basic Usage

```tsx
import React, { useState } from 'react'
import { ModelChooserModal } from 'openrouter-model-picker'
// Option 1 (recommended):
import 'openrouter-model-picker/styles'
// Option 2 (if Option 1 doesn't work):
// import 'openrouter-model-picker/dist/style.css'

function App() {
  const [selectedModel, setSelectedModel] = useState('openai/gpt-4o-mini')
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <button onClick={() => setIsModalOpen(true)}>
        Choose Model: {selectedModel}
      </button>

      <ModelChooserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedModel={selectedModel}
        onModelChange={setSelectedModel}
      />
    </>
  )
}
```

## 🔧 Advanced Usage

### Using the Selected Model

```tsx
import React, { useState } from 'react'
import { ModelChooserModal } from 'openrouter-model-picker'

function AdvancedApp() {
  const [selectedModel, setSelectedModel] = useState('openai/gpt-4o-mini')
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleApiCall = async () => {
    if (!selectedModel) return
    
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: selectedModel, // Use the selected model ID
          messages: [
            { role: 'user', content: 'Hello, how are you?' }
          ]
        })
      })
      
      const data = await response.json()
      console.log('Response:', data)
    } catch (error) {
      console.error('API Error:', error)
    }
  }

  return (
    <div>
      <button onClick={() => setIsModalOpen(true)}>
        Choose Model
      </button>
      
      {selectedModel && (
        <div>
          <p>Selected: {selectedModel}</p>
          <button onClick={handleApiCall}>
            Make API Call
          </button>
        </div>
      )}

      <ModelChooserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedModel={selectedModel}
        onModelChange={setSelectedModel}
        apiEndpoint="https://openrouter.ai/api/v1/models"
        theme="dark"
        maxHeight="90vh"          // Custom height
        maxWidth="1200px"         // Custom width
        className="my-modal"      // Custom CSS class
      />
    </div>
  )
}
```

### With Custom Fallback Data

```tsx
import { ModelChooserModal, ModelInfo } from 'openrouter-model-picker'

const fallbackModels: ModelInfo[] = [
  {
    id: 'openai/gpt-4o-mini',
    name: 'GPT-4o Mini',
    provider: 'OpenAI',
    costTier: 'low',
    description: 'Fast and affordable multimodal model',
    features: ['Vision', 'Fast'],
    pricing: { input: 0.00015, output: 0.0006, currency: 'USD' },
    context: 128000,
    multimodal: true
  }
]

function AppWithFallback() {
  return (
    <ModelChooserModal
      // ... other props
      fallbackModels={fallbackModels}
    />
  )
}
```

## 📋 API Reference

### ModelChooserModalProps

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isOpen` | `boolean` | - | Controls modal visibility |
| `onClose` | `() => void` | - | Called when modal is closed |
| `selectedModel` | `string` | - | Currently selected model ID |
| `onModelChange` | `(modelId: string) => void` | - | Called when model selection changes |
| `apiEndpoint` | `string` | OpenRouter API | Custom API endpoint |
| `fallbackModels` | `ModelInfo[]` | - | Fallback model data |
| `theme` | `'light' \| 'dark' \| 'auto'` | `'light'` | UI theme |
| `maxHeight` | `string` | `'80vh'` | Maximum modal height |
| `maxWidth` | `string` | - | Maximum modal width |
| `className` | `string` | - | Custom CSS class |

### ModelInfo Interface

```typescript
interface ModelInfo {
  id: string                    // Model ID (e.g., "openai/gpt-4o")
  name: string                  // Display name
  provider: string              // Provider name
  costTier: 'free' | 'low' | 'medium' | 'high'
  description: string           // Model description
  features?: string[]           // Capability tags
  pricing?: {
    input: number              // Input token price
    output: number             // Output token price
    currency: string           // Currency code
  }
  context?: number             // Context window size
  multimodal?: boolean         // Supports images/files
}
```

## 🎨 Theming and Customization

### CSS Custom Properties

```css
.openrouter-modal {
  --or-primary-color: #3b82f6;
  --or-primary-hover: #2563eb;
  --or-background: #ffffff;
  --or-text: #111827;
  --or-text-secondary: #6b7280;
  --or-border: #e5e7eb;
}

/* Dark theme */
.openrouter-modal.dark {
  --or-background: #1f2937;
  --or-text: #f9fafb;
  --or-text-secondary: #9ca3af;
  --or-border: #374151;
}
```

### Cost Tier Colors

- **Free**: `#10b981` (green)
- **Low**: `#3b82f6` (blue)
- **Medium**: `#f59e0b` (amber)
- **High**: `#ef4444` (red)

## 🔌 Hooks and Utilities

### useModelData Hook

```tsx
import { useModelData } from '@openrouter/model-chooser'

function CustomComponent() {
  const { models, loading, error, refresh } = useModelData()
  
  // Use models data directly
  return (
    <div>
      {models.map(model => (
        <div key={model.id}>{model.name}</div>
      ))}
    </div>
  )
}
```

### useFiltering Hook

```tsx
import { useFiltering } from '@openrouter/model-chooser'

function FilteredList({ models }) {
  const {
    filteredModels,
    filterState,
    updateFilter,
    clearFilters
  } = useFiltering(models)

  return (
    <div>
      <input
        type="text"
        onChange={(e) => updateFilter('searchTerm', e.target.value)}
        placeholder="Search models..."
      />
      {/* Render filtered models */}
    </div>
  )
}
```

## ♿ Accessibility

The component is built with accessibility in mind:

- **Keyboard Navigation**: Full support for keyboard-only users
- **Screen Readers**: ARIA labels and semantic HTML structure
- **Focus Management**: Proper focus trapping within the modal
- **High Contrast**: Support for high contrast mode
- **Reduced Motion**: Respects `prefers-reduced-motion` setting

## 📱 Responsive Design

### Breakpoints

- **Mobile**: `< 768px` - Simplified layout, touch-optimized
- **Tablet**: `768px - 1024px` - Condensed columns
- **Desktop**: `> 1024px` - Full table layout

### Mobile Adaptations

- Card-based layout instead of table
- Touch-friendly filter controls
- Swipe gestures for navigation
- Bottom sheet modal presentation

## 🔒 Error Handling

The component gracefully handles various error scenarios:

- **API Unavailable**: Falls back to cached or provided fallback data
- **Network Errors**: Shows retry option with error details
- **Rate Limiting**: Displays appropriate messages with retry timers
- **Empty Results**: Clear messaging with filter reset options

## 📊 Performance

### Optimization Features

- **Virtual Scrolling**: Handles 1000+ models efficiently
- **Debounced Search**: 300ms delay to reduce excessive filtering
- **Memoized Operations**: Optimized filtering and sorting
- **Request Caching**: 5-minute cache for API responses
- **Lazy Loading**: Components loaded only when needed

### Performance Targets

- Initial load: `< 500ms`
- Search response: `< 100ms`
- Modal animation: `< 200ms`
- Smooth scrolling: `60fps`
- Memory usage: `< 10MB` for 200+ models

## 🧪 Testing

Run the test suite:

```bash
npm test
```

Run tests with coverage:

```bash
npm run test:coverage
```

## 🛠️ Development

### Setup

```bash
git clone https://github.com/openrouter/model-chooser
cd model-chooser
npm install
```

### Development Server

```bash
npm run dev
```

### Build

```bash
npm run build
```

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## 📞 Support

- 📖 [Documentation](https://github.com/openrouter/model-chooser/docs)
- 🐛 [Issue Tracker](https://github.com/openrouter/model-chooser/issues)
- 💬 [Discord Community](https://discord.gg/openrouter)
- 📧 [Email Support](mailto:support@openrouter.ai)

## 🙏 Acknowledgments

- [OpenRouter](https://openrouter.ai) for the AI model API
- [Lucide React](https://lucide.dev) for the icon set
- [Tailwind CSS](https://tailwindcss.com) for styling inspiration
- The React community for best practices and patterns

---

Built with ❤️ for the AI developer community 