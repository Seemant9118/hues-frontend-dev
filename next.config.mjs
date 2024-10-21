/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.resolve.alias.canvas = false;

    return config;
  },
  images: {
    domains: ['hues-dev.s3.ap-south-1.amazonaws.com'],
  },
};

export default nextConfig;
