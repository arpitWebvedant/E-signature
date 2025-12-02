import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  typescript: {
    // Skip type checking during build
    ignoreBuildErrors: true,
  },
  eslint: {
    // Skip ESLint during build
    ignoreDuringBuilds: true,
  },
  experimental: {
    // Skip static optimization for pages with dynamic imports
    skipTrailingSlashRedirect: true,
  },
  // Skip static optimization to avoid useSearchParams issues
  output: 'standalone',
  webpack(config) {
    config.module.rules.push({
      test: /\.pdf$/,
      type: 'asset/resource', // tells Webpack to handle PDFs as files
    })
    return config
  },
}

export default nextConfig
