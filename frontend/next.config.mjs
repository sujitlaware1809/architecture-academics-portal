/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'architecture-academics.local',
      },
      {
        protocol: 'https',
        hostname: '*.architectureacademics.com',
      },
      {
        protocol: 'https',
        hostname: 'architecture-academics.online',
      },
      {
        protocol: 'https',
        hostname: '*.architecture-academics.online',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
  },
  async rewrites() {
    return {
      beforeFiles: [
        // Production subdomain routing
        {
          source: '/:path*',
          has: [
            {
              type: 'host',
              value: 'courses.architecture-academics.online',
            },
          ],
          destination: '/courses/:path*',
        },
        {
          source: '/:path*',
          has: [
            {
              type: 'host',
              value: 'jobs.architecture-academics.online',
            },
          ],
          destination: '/jobs-portal/:path*',
        },
        {
          source: '/:path*',
          has: [
            {
              type: 'host',
              value: 'events.architecture-academics.online',
            },
          ],
          destination: '/events/:path*',
        },
        {
          source: '/:path*',
          has: [
            {
              type: 'host',
              value: 'workshops.architecture-academics.online',
            },
          ],
          destination: '/workshops/:path*',
        },
        {
          source: '/:path*',
          has: [
            {
              type: 'host',
              value: 'blogs.architecture-academics.online',
            },
          ],
          destination: '/blogs/:path*',
        },
        {
          source: '/:path*',
          has: [
            {
              type: 'host',
              value: 'discussions.architecture-academics.online',
            },
          ],
          destination: '/discussions/:path*',
        },
        
        // Local development subdomain routing
        {
          source: '/:path*',
          has: [
            {
              type: 'host',
              value: 'courses.architecture-academics.local',
            },
          ],
          destination: '/courses/:path*',
        },
        {
          source: '/:path*',
          has: [
            {
              type: 'host',
              value: 'jobs.architecture-academics.local',
            },
          ],
          destination: '/jobs-portal/:path*',
        },
        {
          source: '/:path*',
          has: [
            {
              type: 'host',
              value: 'events.architecture-academics.local',
            },
          ],
          destination: '/events/:path*',
        },
        {
          source: '/:path*',
          has: [
            {
              type: 'host',
              value: 'workshops.architecture-academics.local',
            },
          ],
          destination: '/workshops/:path*',
        },
        {
          source: '/:path*',
          has: [
            {
              type: 'host',
              value: 'blogs.architecture-academics.local',
            },
          ],
          destination: '/blogs/:path*',
        },
        {
          source: '/:path*',
          has: [
            {
              type: 'host',
              value: 'discussions.architecture-academics.local',
            },
          ],
          destination: '/discussions/:path*',
        },
      ],
    }
  },
}

export default nextConfig
