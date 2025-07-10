import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { fileURLToPath } from 'url'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isDemo = mode === 'demo'
  const __dirname = fileURLToPath(new URL('.', import.meta.url))

  if (isDemo) {
    // Demo build configuration for GitHub Pages
    return {
      plugins: [react()],
      base: '/openrouter-model-picker/',  // GitHub Pages repo path
      build: {
        outDir: 'demo-dist',
        emptyOutDir: true,
        // Regular app build, not library
        rollupOptions: {
          input: resolve(__dirname, 'index.html'),
        }
      },
      resolve: {
        alias: {
          '@': resolve(__dirname, './src')
        }
      }
    }
  }

  // Default library build configuration
  return {
    plugins: [react()],
    build: {
      lib: {
        entry: resolve(__dirname, 'src/index.ts'),
        name: 'OpenRouterModelPicker',
        formats: ['es', 'cjs'],
        fileName: (format) => `index.${format === 'es' ? 'mjs' : 'js'}`
      },
      rollupOptions: {
        external: ['react', 'react-dom'],
        output: {
          globals: {
            react: 'React',
            'react-dom': 'ReactDOM'
          },
          // Ensure proper exports for both formats
          exports: 'named'
        }
      },
      // Ensure CSS is extracted
      cssCodeSplit: false
    },
    resolve: {
      alias: {
        '@': resolve(__dirname, './src')
      }
    }
  }
}) 