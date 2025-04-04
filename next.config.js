/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['query1.finance.yahoo.com'],
  },
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    // Required for some packages to work with Next.js
    esmExternals: 'loose',
  },
};

module.exports = nextConfig;
