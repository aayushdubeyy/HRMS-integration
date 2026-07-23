import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { encryptDecryptProxyPlugin } from './vite/encryptDecryptProxyPlugin'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), encryptDecryptProxyPlugin()],
})
