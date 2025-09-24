/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  reactStrictMode: true,
  swcMinify: true,
  productionBrowserSourceMaps: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    domains: ['localhost', 'ic0.app'],
  },
  output: 'standalone',
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
  basePath: '',
  
  // Enable React strict mode
  reactStrictMode: true,
  
  // Enable SWC minification
  swcMinify: true,
  
  // Disable source maps in production
  productionBrowserSourceMaps: false,
  
  // Enable webpack optimizations
  webpack: (config, { isServer }) => {
    // Add any webpack configurations here
    return config;
  },
  
  async rewrites() {
    // Only enable rewrites in development
    if (process.env.NODE_ENV !== 'development') {
      return [];
    }
    
    return [
      // Proxy API requests to IC replica
      {
        source: '/api/ic/:path*',
        destination: 'http://127.0.0.1:4943/api/v2/:path*',
      },
      {
        source: '/api/v2/:path*',
        destination: 'http://127.0.0.1:4943/api/v2/:path*',
      },
      // Remove v3 endpoint as it's not supported by the current IC version
    ];
  },
  
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: 'http://127.0.0.1:4943' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization, X-Request-Id, X-Ic-Api-Version' },
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Expose-Headers', value: 'X-Request-Id, X-Ic-Api-Version' }
        ],
      },
    ];
  },
  
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
      };
    }
    return config;
  },
};

export default nextConfig;
