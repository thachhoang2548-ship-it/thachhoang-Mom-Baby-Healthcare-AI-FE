import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/sepay-api': {
        target: 'https://my.sepay.vn',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/sepay-api/, ''),
      },
    },
  },
  css: {
    postcss: {
      plugins: [tailwindcss(), autoprefixer()],
    },
  },
  build: {
    outDir: 'dist',
  }
})
