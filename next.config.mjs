/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    serverComponentsExternalPackages: ['bcryptjs', '@prisma/client'],
  },
  webpack: (config) => {
    return config;
  },
}

export default nextConfig;
