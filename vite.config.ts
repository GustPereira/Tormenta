/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
// Em produção o app é servido em https://GustPereira.github.io/Tormenta/,
// então o base precisa ser '/Tormenta/'. Em dev/preview local fica em '/'.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/Tormenta/' : '/',
  plugins: [react(), tailwindcss()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
}))
