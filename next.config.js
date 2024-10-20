const path = require('path');

const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    config.resolve.alias['@'] = path.resolve(__dirname);
    
    // Remove manual CSS loader configuration. Next.js has built-in CSS support.
    
    return config;
  },
};

module.exports = nextConfig;