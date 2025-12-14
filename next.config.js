// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.experiments = { ...config.experiments, topLevelAwait: true };
    return config;
  },
  output: 'export', // если захотите static export позже
  reactStrictMode: false,
};

export default nextConfig;
module.exports = nextConfig; 
