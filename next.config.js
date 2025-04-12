/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'cummaimages.s3.eu-north-1.amazonaws.com',
      'example.com',
      's3.amazonaws.com',
      'amazonaws.com',
      'nigga.com',
      'wb.com',
      'localhost',
      'res.cloudinary.com',
      'cloudinary.com',
      'images.unsplash.com',
      'storage.googleapis.com'
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Disable all caching in production
  experimental: {
    serverComponentsExternalPackages: ['mongodb'],
  },
  // Force all pages to be regenerated on each request in production
  onDemandEntries: {
    // period (in ms) where the server will keep pages in the buffer
    maxInactiveAge: 10 * 1000,
    // number of pages that should be kept simultaneously without being disposed
    pagesBufferLength: 1,
  }
}

module.exports = nextConfig 