import { defineConfig } from 'vite';

export default defineConfig({
  base: './', // Ensures assets load cleanly in both browser and Electron via file://
  server: {
    port: 5174,
    host: true
  }
});
