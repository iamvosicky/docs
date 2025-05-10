/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Force all pages to be dynamic
  // This is a workaround for the useSearchParams issue
  // See: https://nextjs.org/docs/messages/missing-suspense-with-csr-bailout
  output: 'export',
  distDir: 'out',
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
