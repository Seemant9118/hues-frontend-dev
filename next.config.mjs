/** @type {import('next').NextConfig} */

// next-intl plugin setup
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin(); // withNextIntl is a Next.js plugin

const nextConfig = {
  webpack: (config) => {
    config.resolve.alias.canvas = false;

    return config;
  },
  images: {
    domains: ['hues-dev.s3.ap-south-1.amazonaws.com'],
  },
};

export default withNextIntl(nextConfig);
