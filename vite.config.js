// Vite = the tool that runs the dev server and builds the React app.
// Vitest (the test runner) reads the "test" section below.
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom', // pretend to be a browser so React can render in tests
    setupFiles: './src/setupTests.js',
    globals: true,
  },
})
