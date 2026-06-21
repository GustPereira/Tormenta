/// <reference types="vitest/config" />
import { copyFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { defineConfig, type PluginOption } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

/**
 * Fallback SPA para GitHub Pages: copia index.html → 404.html no build, para
 * que links profundos (BrowserRouter, ex.: /ficha/compartilhada/:id) funcionem
 * ao abrir/recarregar — o Pages serve 404.html em rotas desconhecidas.
 */
function spa404Fallback(): PluginOption {
  return {
    name: 'spa-404-fallback',
    apply: 'build',
    closeBundle() {
      const index = resolve('dist/index.html')
      if (existsSync(index)) copyFileSync(index, resolve('dist/404.html'))
    },
  }
}

// https://vite.dev/config/
// Em produção o app é servido em https://GustPereira.github.io/Tormenta/,
// então o base precisa ser '/Tormenta/'. Em dev/preview local fica em '/'.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/Tormenta/' : '/',
  plugins: [react(), tailwindcss(), spa404Fallback()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
}))
