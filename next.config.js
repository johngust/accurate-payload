import { withPayload } from '@payloadcms/next/withPayload'

import redirects from './redirects.js'

const NEXT_PUBLIC_SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  productionBrowserSourceMaps: false,
  serverExternalPackages: ['payload', 'sharp'],
  images: {
    remotePatterns: [
      ...[NEXT_PUBLIC_SERVER_URL, 'http://localhost:3000'].map((item) => {
        try {
          const url = new URL(item)
          return {
            hostname: url.hostname,
            protocol: url.protocol.replace(':', ''),
          }
        } catch (e) {
          return { hostname: 'localhost' }
        }
      }),
      {
        hostname: '*.public.blob.vercel-storage.com',
        protocol: 'https',
      },
      {
        hostname: 'placehold.co',
        protocol: 'https',
      },
      {
        hostname: 'vsedlyavanny.kz',
        protocol: 'https',
      }
    ],
  },
  reactStrictMode: true,
  redirects,
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    return webpackConfig
  },
}

export default withPayload(nextConfig)
