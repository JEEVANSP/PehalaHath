import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
  ],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  define: {
    'process.env': {
      VITE_GOOGLE_MAPS_API_KEY: JSON.stringify('AIzaSyB41DRUbKWJHPxaFjMAwdrzWzbVKartNGg'),
    },
  },
  optimizeDeps: {
    include: ['react-router-dom'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-router-dom': ['react-router-dom'],
        },
      },
    },
  },
})