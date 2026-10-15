import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    proxy: {
      '/api/euroliga': {
        target: 'https://api-live.euroleague.net',
        changeOrigin: true,
        rewrite: (ruta) => ruta.replace(/^\/api\/euroliga/, ''),
      },
    },
  },
})
