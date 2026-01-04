/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
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
  },
  // Turbopack is enabled via --turbo flag in dev script
  // No webpack config needed when using Turbopack
};

module.exports = nextConfig;

