import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: parseInt(process.env.PORT) || 5173,
    strictPort: false,
    allowedHosts: ['.onrender.com', 'localhost'],
    hmr: {
      // Only use port 443 in production (Render.com), use default in development
      ...(process.env.NODE_ENV === 'production' ? { clientPort: 443 } : {})
    }
  },
  preview: {
    host: '0.0.0.0',
    port: parseInt(process.env.PORT) || 5173,
    strictPort: false,
    allowedHosts: ['.onrender.com', 'localhost']
  }
})
