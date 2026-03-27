// /** @type {import('next').NextConfig} */
// const nextConfig = {};

// export default nextConfig;


/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Allow loading images from IPFS via Pinata gateway
    remotePatterns: [
      {
        protocol: "https",
        hostname: "gateway.pinata.cloud",
      },
      {
        protocol: "https",
        hostname: "ipfs.io",
      },
    ],
  },
};

module.exports = nextConfig;