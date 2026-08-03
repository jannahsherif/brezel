import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // 5181, one above the prototype's 5180, so both can run side by side during design review.
    port: process.env.PORT ? Number(process.env.PORT) : 5181,
    host: true,
  },
})
