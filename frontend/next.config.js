/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // Disable static optimization to prevent build errors
  output: 'standalone',
  
  // Ensure proper image optimization
  images: {
    unoptimized: true,
  },
  
  // Add webpack configuration to handle eval issue
  webpack: (config, { dev, isServer }) => {
    // In development, Next.js uses eval by default
    // This can cause CSP issues, so we override it
    if (dev && !isServer) {
      config.devtool = 'cheap-module-source-map';
    }
    return config;
  },
  
  // Add headers to fix CSP issues
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://backend-production-36f1.up.railway.app"
          },
        ],
      },
    ];
  },
}

module.exports = nextConfig
