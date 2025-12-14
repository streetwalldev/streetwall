/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.experiments = { ...config.experiments, topLevelAwait: true };
    return config;
  },
  // output: 'export', // ⚠️ раскомментируйте ТОЛЬКО если делаете static export (тогда SSR/ISR/апи-роуты не работают!)
  reactStrictMode: false,
};

export default nextConfig;
// ✅ УДАЛИТЕ: module.exports = nextConfig;
