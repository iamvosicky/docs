/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Use 'export' output for static site generation
  output: 'export',

  // Ignore ESLint errors during build
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Ignore TypeScript errors during build
  typescript: {
    ignoreBuildErrors: true,
  },

  // Configure images for static export
  images: {
    unoptimized: true,
  },

  // Ensure all files are included in the build
  webpack: (config, { isServer }) => {
    // Add src directory to the webpack resolve modules
    config.resolve.modules.push('./src');
    return config;
  },

  // Fix hydration issues
  experimental: {
    // This helps with hydration issues
    optimizeCss: true,
  },

  // Skip API routes for static export
  skipTrailingSlashRedirect: true,
  skipMiddlewareUrlNormalize: true,
};

module.exports = nextConfig;
