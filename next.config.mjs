import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare';

if (process.argv.includes('dev')) {
  initOpenNextCloudflareForDev();
}

const remotePatterns = [];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  typedRoutes: true,
  images: {
    remotePatterns
  }
};

export default nextConfig;
