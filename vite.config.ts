import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react()],
    // Set base to './' to ensure relative paths work on GitHub Pages or IPFS
    base: './', 
    define: {
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
      'process.env.VITE_AI_MODELS': JSON.stringify(env.VITE_AI_MODELS),
    },
  };
});
