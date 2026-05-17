/** @type {import('next').NextConfig} */
const nextConfig = {
  // This tells Next.js to use src/app as the app directory
  experimental: {
    serverComponentsExternalPackages: ['bcryptjs', '@prisma/client'],
  },
  // Ensure src folder is recognized
  webpack: (config) => {
    return config;
  },
}

export default nextConfig
