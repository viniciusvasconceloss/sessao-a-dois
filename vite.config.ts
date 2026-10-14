import { svelte } from '@sveltejs/vite-plugin-svelte'
import { defineConfig } from 'vite'

export default defineConfig({
  base: './', // served from /<repo>/ on GitHub Pages
  plugins: [svelte()],
})
