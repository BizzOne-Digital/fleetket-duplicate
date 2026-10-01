/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    qualities: [70, 75, 85],
    remotePatterns: [{ protocol: 'https', hostname: 'images.unsplash.com' }],
    // Admin uploads are served from MongoDB through /api/uploads/** (see app/api/uploads).
    localPatterns: [
      { pathname: '/api/uploads/**', search: '' },
      { pathname: '/images/**', search: '' },
      { pathname: '/placeholder.jpg', search: '' },
    ],
  },
  serverExternalPackages: ['mongoose'],
  async redirects() {
    // Legacy routes from the previous Fleeket site.
    return [
      { source: '/PrivacyPolicy', destination: '/privacy', permanent: true },
      { source: '/TermsConditions', destination: '/terms', permanent: true },
      // Friendly admin aliases.
      { source: '/admin/dashboard', destination: '/admin', permanent: false },
      { source: '/admin/services', destination: '/admin/categories', permanent: false },
      { source: '/admin/pricing', destination: '/admin/content/pricing', permanent: false },
    ]
  },
}

export default nextConfig
