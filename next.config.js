/** @type {import('next').NextConfig} */

// '' on Vercel (kamikaze.host), '/kamikaze' on GitHub Pages (bun run build:pages)
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? ''

const nextConfig = {
  output: 'export',
  basePath,
  assetPrefix: basePath,
  trailingSlash: true,
  images: { unoptimized: true },
  devIndicators: {
    buildActivity: false,
    appIsrStatus: false,
  },
}

module.exports = nextConfig
