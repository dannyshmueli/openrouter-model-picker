# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React component library that provides a model selection UI for OpenRouter. It fetches available AI models from the OpenRouter API and presents them in a searchable, filterable interface with pricing information.

## Development Commands

```bash
# Install dependencies
npm install

# Start development server (runs demo app)
npm run dev

# Build the library
npm run build

# Create package for testing
npm pack

# Type checking
npm run type-check

# Linting
npm run lint

# Preview built library
npm run preview
```

## Architecture

The library exports a single main component `ModelChooserModal` with supporting hooks and utilities:

- **src/components/ModelChooserModal.tsx**: Main modal component that orchestrates the UI
- **src/hooks/useModelData.ts**: Fetches and manages model data from OpenRouter API
- **src/hooks/useFiltering.ts**: Handles search and filter logic for models
- **src/types/index.ts**: TypeScript interfaces for models, API responses, and component props
- **src/utils/apiClient.ts**: API client for OpenRouter endpoints
- **src/utils/formatters.ts**: Utility functions for formatting prices and model names

The demo app (src/DemoApp.tsx) showcases library usage and is served by npm run dev.

## Key Technical Details

1. **API Integration**: The component fetches from `https://openrouter.ai/api/v1/models` by default. Users can override this with a custom API URL or provide static model data.

2. **State Management**: Uses React hooks for local state. No external state management library.

3. **Styling**: CSS modules with the main modal styles in src/styles/modal.css. The component is designed to be customizable via className props.

4. **Build Output**: Vite builds to both ES modules and CommonJS formats. TypeScript declarations are generated separately.

5. **No Test Infrastructure**: Currently no unit tests. Consider using Vitest for future testing needs as it integrates well with Vite.

6. **Cross-platform Build**: Uses a Node.js script (scripts/copy-styles.js) for file operations to ensure Windows compatibility.

## Common Tasks

### Adding a New Feature to the Modal
1. Update types in src/types/index.ts if needed
2. Modify the component logic in src/components/ModelChooserModal.tsx
3. Update any affected hooks or utilities
4. Test using the demo app (npm run dev)
5. Update README.md with any API changes

### Modifying the API Client
- Edit src/utils/apiClient.ts
- The fetchModels function handles API requests with built-in error handling
- Consider CORS when testing with different API endpoints

### Updating Styles
- Modal styles are in src/styles/modal.css
- Component-specific styles use CSS-in-JS via style props
- Maintain accessibility (focus states, ARIA attributes)