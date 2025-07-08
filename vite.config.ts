import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(() => ({
  server: {
    host: "0.0.0.0",
    port: 5173,
  },
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Production optimizations
    target: 'esnext',
    minify: 'esbuild',
    sourcemap: process.env.NODE_ENV === 'development',
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Vendor chunks
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor';
            }
            if (id.includes('@supabase')) {
              return 'supabase';
            }
            if (id.includes('@radix-ui') || id.includes('lucide-react')) {
              return 'ui-vendor';
            }
            if (id.includes('zod') || id.includes('react-hook-form')) {
              return 'forms-vendor';
            }
            if (id.includes('@tanstack') || id.includes('react-query')) {
              return 'query-vendor';
            }
            // Other large libraries
            return 'vendor';
          }
          
          // Page chunks
          if (id.includes('/pages/')) {
            if (id.includes('agent/')) {
              return 'pages-agent';
            }
            return 'pages-main';
          }
          
          // Component chunks
          if (id.includes('/components/')) {
            if (id.includes('dashboard/')) {
              return 'components-dashboard';
            }
            if (id.includes('workflows/')) {
              return 'components-workflows';
            }
            if (id.includes('forms/')) {
              return 'components-forms';
            }
            if (id.includes('agents/')) {
              return 'components-agents';
            }
            return 'components-ui';
          }
          
          // Service and utility chunks
          if (id.includes('/services/') || id.includes('/hooks/')) {
            return 'services';
          }
          
          // Security and validation chunks
          if (id.includes('security') || id.includes('validation') || id.includes('audit')) {
            return 'security';
          }
          
          // Integration chunks
          if (id.includes('/integrations/')) {
            return 'integrations';
          }
        },
        // Optimize asset naming
        chunkFileNames: () => {
          return `assets/[name]-[hash].js`;
        },
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return `assets/images/[name]-[hash][extname]`;
          }
          if (/css/i.test(ext)) {
            return `assets/styles/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        }
      },
    },
  },
}));
