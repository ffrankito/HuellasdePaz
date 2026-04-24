import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  serverExternalPackages: ['pdfkit'],
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Prevent webpack from trying to bundle pdfkit and its dependencies
      const existing = Array.isArray(config.externals) ? config.externals : config.externals ? [config.externals] : []
      config.externals = [...existing, 'pdfkit']
    } else {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        canvas: false,
      }
    }
    return config
  },
}

export default nextConfig
