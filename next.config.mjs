/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    qualities: [70, 75, 85],
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      // The client's existing image hosts (category/sub-service photos and page imagery from fleeket.com).
      { protocol: 'https', hostname: 'api.fleeket.com', pathname: '/image/**' },
      { protocol: 'https', hostname: 'www.fleeket.com', pathname: '/assets/**' },
      { protocol: 'https', hostname: 'www.fleeket.com', pathname: '/media/**' },
    ],
    // Admin uploads are served from MongoDB through /api/uploads/** (see app/api/uploads).
    localPatterns: [
      { pathname: '/api/uploads/**', search: '' },
      { pathname: '/images/**', search: '' },
      { pathname: '/placeholder.jpg', search: '' },
    ],
  },
  serverExternalPackages: ['mongoose'],
  // Low-RAM build machines: NEXT_BUILD_CPUS=2 pnpm build
  ...(process.env.NEXT_BUILD_CPUS && { experimental: { cpus: Number(process.env.NEXT_BUILD_CPUS) } }),
  async redirects() {
    // Legacy routes from the previous Fleeket site.
    return [
      { source: '/PrivacyPolicy', destination: '/privacy', permanent: true },
      { source: '/TermsConditions', destination: '/terms', permanent: true },
      { source: '/WhoAreWe', destination: '/about', permanent: true },
      { source: '/Contactus', destination: '/contact', permanent: true },
      { source: '/BecomeTasker', destination: '/become-a-tasker', permanent: true },
      { source: '/CreateAccount', destination: '/register', permanent: true },
      { source: '/SignIn', destination: '/login', permanent: true },
      // Pages from the earlier redesign that this site no longer has.
      { source: '/services', destination: '/#services', permanent: false },
      { source: '/how-it-works', destination: '/#how-it-works', permanent: false },
      { source: '/faq', destination: '/#faq', permanent: false },
      // /ServiceCategory/:id(/:subId) is resolved by app/ServiceCategory (needs a database lookup).
      // Friendly admin aliases.
      { source: '/admin/dashboard', destination: '/admin', permanent: false },
      { source: '/admin/services', destination: '/admin/categories', permanent: false },
      { source: '/admin/pricing', destination: '/admin/content/pricing', permanent: false },
    ]
  },
}

export default nextConfig
