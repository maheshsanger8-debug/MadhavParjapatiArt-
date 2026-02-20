import { defineConfig } from 'vite';
import { resolve } from 'path';
import { visualizer } from 'rollup-plugin-visualizer';
import compressPlugin from 'vite-plugin-compression';
import { VitePWA } from 'vite-plugin-pwa';
import legacy from '@vitejs/plugin-legacy';
import { imagetools } from 'vite-imagetools';

export default defineConfig(({ command, mode }) => {
  const isProduction = mode === 'production';
  const isDevelopment = mode === 'development';
  
  return {
    root: '.',
    publicDir: 'public',
    base: isProduction ? '/' : '/',
    
    // Path aliases
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
        '@components': resolve(__dirname, 'src/components'),
        '@pages': resolve(__dirname, 'src/pages'),
        '@utils': resolve(__dirname, 'src/utils'),
        '@services': resolve(__dirname, 'src/services'),
        '@assets': resolve(__dirname, 'src/assets'),
        '@styles': resolve(__dirname, 'src/styles'),
        '@config': resolve(__dirname, 'src/config')
      }
    },

    // Development server configuration
    server: {
      port: 3000,
      open: true,
      host: true,
      cors: true,
      strictPort: false,
      hmr: {
        overlay: true
      },
      proxy: {
        // Proxy API requests during development
        '/api': {
          target: 'http://localhost:5000',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, '')
        }
      },
      watch: {
        usePolling: true,
        interval: 1000
      }
    },

    // Preview server configuration
    preview: {
      port: 3001,
      open: true,
      host: true,
      cors: true
    },

    // Build configuration
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      target: 'es2020',
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: isProduction,
          drop_debugger: isProduction,
          pure_funcs: isProduction ? ['console.log', 'console.info'] : []
        },
        format: {
          comments: false
        }
      },
      sourcemap: isDevelopment,
      reportCompressedSize: true,
      chunkSizeWarningLimit: 1000,
      
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'index.html'),
          admin: resolve(__dirname, 'admin.html'),
          home: resolve(__dirname, 'home.html'),
          products: resolve(__dirname, 'products.html'),
          'product-detail': resolve(__dirname, 'product-detail.html'),
          cart: resolve(__dirname, 'cart.html'),
          checkout: resolve(__dirname, 'checkout.html'),
          login: resolve(__dirname, 'login.html'),
          signup: resolve(__dirname, 'signup.html'),
          about: resolve(__dirname, 'about.html'),
          contact: resolve(__dirname, 'contact.html'),
          faq: resolve(__dirname, 'faq.html'),
          privacy: resolve(__dirname, 'privacy.html'),
          terms: resolve(__dirname, 'terms.html'),
          blog: resolve(__dirname, 'blog.html'),
          gallery: resolve(__dirname, 'gallery.html'),
          profile: resolve(__dirname, 'profile.html'),
          orders: resolve(__dirname, 'orders.html'),
          wishlist: resolve(__dirname, 'wishlist.html'),
          shipping: resolve(__dirname, 'shipping.html'),
          returns: resolve(__dirname, 'returns.html')
        },
        
        output: {
          // Manual chunk splitting for better caching
          manualChunks: {
            'vendor': [
              'firebase/app',
              'firebase/auth', 
              'firebase/firestore',
              'firebase/storage',
              'firebase/analytics'
            ],
            'ui-components': [
              './src/components/header.js',
              './src/components/footer.js',
              './src/components/cart.js',
              './src/components/product-card.js'
            ],
            'utils': [
              './src/utils/i18n.js',
              './src/utils/theme.js',
              './src/utils/auth.js'
            ]
          },
          
          // Asset file naming
          entryFileNames: isProduction ? 'assets/[name].[hash].js' : 'assets/[name].js',
          chunkFileNames: isProduction ? 'assets/[name].[hash].js' : 'assets/[name].js',
          assetFileNames: isProduction ? 'assets/[name].[hash].[ext]' : 'assets/[name].[ext]'
        }
      }
    },

    // Dependency optimization
    optimizeDeps: {
      include: [
        'firebase/app',
        'firebase/auth',
        'firebase/firestore', 
        'firebase/storage',
        'firebase/analytics',
        'lodash-es',
        'date-fns'
      ],
      exclude: ['@firebase/app']
    },

    // Environment variables
    define: {
      'process.env.VITE_APP_VERSION': JSON.stringify(process.env.npm_package_version),
      'process.env.VITE_BUILD_TIME': JSON.stringify(new Date().toISOString())
    },

    // Plugins
    plugins: [
      // Image optimization
      imagetools({
        defaultDirectives: new URLSearchParams({
          format: 'webp',
          quality: '80'
        })
      }),

      // PWA support
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'madhav-logo.svg', 'apple-touch-icon.png'],
        manifest: {
          name: 'Madhav Prajapati Art',
          short_name: 'Madhav Art',
          description: 'Handcrafted Clay Diyas from Bagwali, Panchkula',
          theme_color: '#D4AF37',
          background_color: '#ffffff',
          display: 'standalone',
          icons: [
            {
              src: 'pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: 'pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any maskable'
            }
          ]
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,webp}'],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
                }
              }
            },
            {
              urlPattern: /^https:\/\/firebasestorage\.googleapis\.com\/.*/i,
              handler: 'StaleWhileRevalidate',
              options: {
                cacheName: 'firebase-storage-cache',
                expiration: {
                  maxEntries: 50,
                  maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
                }
              }
            }
          ]
        }
      }),

      // Legacy browser support (if needed)
      legacy({
        targets: ['defaults', 'not IE 11']
      }),

      // Gzip compression
      compressPlugin({
        verbose: true,
        disable: false,
        threshold: 10240,
        algorithm: 'gzip',
        ext: '.gz'
      }),

      // Brotli compression
      compressPlugin({
        verbose: true,
        disable: false,
        threshold: 10240,
        algorithm: 'brotliCompress',
        ext: '.br'
      }),

      // Bundle analyzer (only in analyze mode)
      isProduction && visualizer({
        filename: 'dist/stats.html',
        open: true,
        gzipSize: true,
        brotliSize: true
      })
    ].filter(Boolean),

    // CSS configuration
    css: {
      modules: {
        localsConvention: 'camelCase',
        generateScopedName: isProduction ? '[hash:base64:8]' : '[name]__[local]__[hash:base64:5]'
      },
      preprocessorOptions: {
        scss: {
          additionalData: '@import "@styles/variables.scss";'
        }
      },
      devSourcemap: isDevelopment
    },

    // JSON configuration
    json: {
      namedExports: true,
      stringify: false
    },

    // Test configuration (if using Vitest)
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './src/test/setup.js',
      coverage: {
        reporter: ['text', 'json', 'html']
      }
    }
  };
});

// Environment-specific configuration
export const envConfig = {
  development: {
    apiUrl: 'http://localhost:5000/api',
    firebase: {
      projectId: 'dev-madhav-prajapati-art'
    }
  },
  production: {
    apiUrl: 'https://api.madhav-prajapati-art.web.app/api',
    firebase: {
      projectId: 'madhav-prajapati-art'
    }
  },
  staging: {
    apiUrl: 'https://staging-api.madhav-prajapati-art.web.app/api',
    firebase: {
      projectId: 'staging-madhav-prajapati-art'
    }
  }
};