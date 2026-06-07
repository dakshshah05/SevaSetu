import { defineConfig } from 'vite'

export default defineConfig({
  // Use subfolder base path on GitHub Actions, default to root for Vercel and local runs
  base: process.env.GITHUB_ACTIONS ? '/SevaSetu/' : '/',
})
