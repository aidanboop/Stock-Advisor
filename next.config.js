/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove static export configuration that was needed for GitHub Pages
  // Vercel handles Next.js apps natively without requiring static export
  images: {
    domains: ['query1.finance.yahoo.com'],
  },
};

module.exports = nextConfig;
