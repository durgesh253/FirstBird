import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: parseInt(process.env.PORT) || 5173,
    strictPort: false,
    allowedHosts: ['.onrender.com', 'localhost'],
    hmr: {
      clientPort: 443
    }
  },
  preview: {
    host: '0.0.0.0',
    port: parseInt(process.env.PORT) || 5173,
    strictPort: false,
    allowedHosts: ['.onrender.com', 'localhost']
  }
})
