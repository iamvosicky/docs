/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',

  // Fix for outputFileTracingRoot
  outputFileTracingRoot: __dirname,

  // Ignore ESLint errors during build
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Ignore TypeScript errors during build
  typescript: {
    ignoreBuildErrors: true,
  },

  // Ensure all files are included in the build
  webpack: (config, { isServer }) => {
    // Add src directory to the webpack resolve modules
    config.resolve.modules.push('./src');
    return config;
  },
};

module.exports = nextConfig;
