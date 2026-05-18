/** @type {import('next').NextConfig} */

// ===================================================
// FIRSTCRY - NEXT.JS CONFIGURATION
// Optimized for memory efficiency
// ===================================================

const nextConfig = {
  // ===================================================
  // OUTPUT CONFIGURATION
  // ===================================================
  output: 'standalone',

  // ===================================================
  // EXPERIMENTAL FEATURES
  // ===================================================
  experimental: {
    // Disable worker threads to prevent Tailwind v4 Node Worker EINVAL crashes on Windows
    workerThreads: false,
    // Enable optimized package imports - crucial for memory
    optimizePackageImports: [
      'framer-motion',
      '@tanstack/react-query',
      'react-hook-form',
      'lucide-react',
      'radix-ui',
    ],
    // Use esm Externals for better tree shaking
    esmExternals: true,
    // Optimize server actions
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },

  // ===================================================
  // IMAGE OPTIMIZATION
  // ===================================================
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.amazonaws.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.cloudfront.net',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5181',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '5181',
        pathname: '/**',
      },
    ],
    formats: ['image/webp'],
    qualities: [40, 60, 70, 75, 78, 85, 100],
    deviceSizes: [320, 640, 768, 1024],
    imageSizes: [64, 128, 192, 256],
    minimumCacheTTL: 86400,
    maximumRedirects: 3,
    dangerouslyAllowSVG: false,
    unoptimized: false,
    localPatterns: [
      {
        pathname: '/images/**',
      },
    ],
  },

  // ===================================================
  // COMPILER OPTIONS
  // ===================================================
  compiler: {
    // Remove console logs in production
    removeConsole: process.env.NODE_ENV === 'production',
    // SWC minification is enabled by default in production
  },

  // ===================================================
  // TRAILING SLASH
  // ===================================================
  trailingSlash: false,

  // ===================================================
  // REDIRECTS
  // ===================================================
  async redirects() {
    return [];
  },

  // ===================================================
  // REWRITES
  // ===================================================
  async rewrites() {
    const apiBase =
      process.env.API_INTERNAL_URL?.replace(/\/$/, '') || 'http://localhost:5181';

    return [
      {
        source: '/api/:path*',
        destination: `${apiBase}/api/:path*`,
      },
      {
        source: '/hubs/:path*',
        destination: `${apiBase}/hubs/:path*`,
      },
    ];
  },

  // ===================================================
  // SECURITY HEADERS
  // ===================================================
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
        ],
      },
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, max-age=0',
          },
        ],
      },
    ];
  },

  // ===================================================
  // SERVER EXTERNAL PACKAGES
  // ===================================================
  serverExternalPackages: [],

  // ===================================================
  // WEBPACK CONFIGURATION
  // Disable caching in dev to free memory
  // ===================================================
  webpack: (config, { dev, isServer }) => {
    // Disable disk cache in dev to prevent memory buildup
    if (dev) {
      config.cache = false;
    }
    
    // Optimize memory for production builds
    if (!dev) {
      config.optimization = {
        ...config.optimization,
        // Split chunks for better memory management
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
            },
            framerMotion: {
              test: /[\\/]node_modules[\\/]framer-motion[\\/]/,
              name: 'framer-motion',
              chunks: 'all',
              priority: 10,
            },
            recharts: {
              test: /[\\/]node_modules[\\/]recharts[\\/]/,
              name: 'recharts',
              chunks: 'all',
              priority: 10,
            },
          },
        },
        // Minimize runtime chunk
        runtimeChunk: 'single',
      };
    }
    
    return config;
  },

  // ===================================================
  // TYPESCRIPT
  // ===================================================
  typescript: {
    ignoreBuildErrors: true,
  },

  // ===================================================
  // TURBOPACK (required for Next.js 16)
  // ===================================================
  turbopack: {
    root: process.cwd(),
  },
};

// ESLint config moved to eslint.config.mjs file
// Build will ignore ESLint errors

export default nextConfig;
