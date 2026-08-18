import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    // Prevent Vite from walking up to the parent monorepo postcss.config
    // (Tailwind v3), which breaks this project's Tailwind v4 setup.
    css: {
      postcss: path.resolve(__dirname, 'postcss.config.mjs'),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
  };
});
