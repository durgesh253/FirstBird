import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    host: true,
    port: 5173
  },
  preview: {
    host: '0.0.0.0',
    port: process.env.PORT || 5173
  }
})
