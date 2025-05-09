/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  // Ensure the application is accessible on all network interfaces

  // Explicitly set the source directory
  experimental: {
    outputFileTracingRoot: __dirname,
  },

  // Ensure all files are included in the build
  webpack: (config, { isServer }) => {
    // Add src directory to the webpack resolve modules
    config.resolve.modules.push('./src');

    return config;
  },
};

module.exports = nextConfig;
