import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'happy-dom',
    setupFiles: './src/test-setup.ts',
  },
  server: {
    proxy: {
      '/api': 'http://localhost:8080',
    },
  },
})
