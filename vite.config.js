import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three'],
          animations: ['gsap'],
          audio: ['howler']
        }
      }
    }
  },
  assetsInclude: ['**/*.gltf', '**/*.glb', '**/*.hdr']
});

