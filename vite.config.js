import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxy para as requisições feitas para /users ou outras APIs
      '/users': 'http://localhost:3000', // Redireciona para o servidor backend
      '/register': 'http://localhost:3000', // Se você também tiver outras rotas como /register
    }
  }
})
