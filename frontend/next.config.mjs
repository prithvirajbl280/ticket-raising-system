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
}

module.exports = nextConfig
