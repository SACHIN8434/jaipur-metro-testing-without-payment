import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
})
// import { defineConfig } from 'vite';
// import react from '@vitejs/plugin-react';
// import tailwindcss from '@tailwindcss/vite'

// export default defineConfig({
//   plugins: [react(),tailwindcss(),],
//   server: {
//     port: 5173,
//     proxy: {
//       // Node server (auth, signup, login)
//       '/user': {
//         target: 'http://192.168.100.45:8085',
//         changeOrigin: true,
//         secure: false,
//         rewrite: (path) => path.replace(/^\/user/, ''),
//       },

//       // Go server (stations, fare, routes)
//       '/api': {
//         target: 'http://192.168.100.45:3000',
//         changeOrigin: true,
//         secure: false,
//         rewrite: (path) => path.replace(/^\/api/, ''),
//       },
//     },
//   },
// });











