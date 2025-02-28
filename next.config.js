/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
    domains: ['fal.ai', 'cdn.fal.ai'], // Add any other domains your images come from
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.fal.ai',
      },
    ],
  },
  basePath: '/archgen-ai',
  assetPrefix: '/archgen-ai',
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig 