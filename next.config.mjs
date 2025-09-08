/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    domains: ['localhost', 'ic0.app', '127.0.0.1'],
  },
  // Enable static exports for static site generation
  output: 'standalone',
  // Configure page extensions
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
  // Add base path if needed
  basePath: '',
  // CORS configuration
  async headers() {
    return [
      {
        // matching all API routes
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: 'http://localhost:3000' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,DELETE,PATCH,POST,PUT,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version' },
        ]
      }
    ]
  },
  // Configure webpack
  webpack: (config, { isServer, dev }) => {
    // Handle node: protocol
    config.resolve.alias = {
      ...config.resolve.alias,
      // Map node: protocol imports to browser-compatible alternatives
      'node:path': 'path-browserify',
      'node:process': 'process/browser',
      'node:stream': 'stream-browserify',
      'node:util': 'util',
      'node:url': 'url',
      'node:zlib': 'browserify-zlib',
      'node:stream/web': 'stream-browserify',
    };

    // Add fallback for Node.js modules
    config.resolve.fallback = {
      ...(config.resolve.fallback || {}),
      // Browser-compatible alternatives for Node.js built-ins
      path: 'path-browserify',
      stream: 'stream-browserify',
      util: 'util/',
      url: 'url/',
      zlib: 'browserify-zlib',
      // Disable Node.js built-ins that aren't needed in the browser
      fs: false,
      net: false,
      tls: false,
      dns: false,
      child_process: false,
    };

    // For client-side only
    if (!isServer) {
      // Add client-side specific configurations if needed
    }

    // For development mode only
    if (dev) {
      // Add development specific configurations if needed
    }

    return config;
  },
  // Handle static file serving in production
  async headers() {
    return [
      {
        source: '/_next/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type' },
        ],
      },
    ];
  },
};

export default nextConfig;
