import { defineConfig } from 'astro/config'
import tailwindcss from '@tailwindcss/vite'
import react from '@astrojs/react'

export default defineConfig({
  output: 'static',
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      include: ['react', 'react-dom', 'lucide-react'],
    },
  },
})
