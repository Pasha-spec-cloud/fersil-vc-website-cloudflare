import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare';

if (process.argv.includes('dev')) {
  initOpenNextCloudflareForDev();
}

const remotePatterns = [];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'standalone',
  experimental: {
    typedRoutes: true
  },
  images: {
    remotePatterns
  },
  eslint: {
    dirs: ['app', 'components', 'lib', 'tests']
  }
};

export default nextConfig;
