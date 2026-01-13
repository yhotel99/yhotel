/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  compress: true, // Enable gzip compression
  // swcMinify is default in Next.js 15, no need to specify
  eslint: {
    // Tắt ESLint trong quá trình build
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Tắt TypeScript checking trong quá trình build (nếu cần)
    // ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'lovable.dev',
      },
      {
        protocol: 'https',
        hostname: 'img.vietqr.io',
      },
      {
        protocol: 'https',
        hostname: 'rnuuftucapucuavqlgbx.supabase.co',
      },
    ],
    formats: ['image/avif', 'image/webp'], // Enable modern image formats
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60, // Cache images for 60 seconds
  },
  // Optimize production builds
  productionBrowserSourceMaps: false, // Disable source maps in production for smaller builds
  // Turbopack is enabled via --turbo flag in dev script
  // No webpack config needed when using Turbopack
};

module.exports = nextConfig;

