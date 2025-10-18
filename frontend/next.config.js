const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    // Garante que o alias '@' continue apontando para src em novas versões do bundler
    config.resolve.alias['@'] = config.resolve.alias['@'] || path.resolve(__dirname, 'src');
    return config;
  }
};

module.exports = nextConfig;
