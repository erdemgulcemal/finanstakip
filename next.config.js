/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['flags.fmcdn.net'], // Bayrak resimleri için
  },
  reactStrictMode: true,
  output: 'standalone',
  trailingSlash: true,
  experimental: {
    outputFileTracingRoot: process.cwd(),
  },
}

module.exports = nextConfig 