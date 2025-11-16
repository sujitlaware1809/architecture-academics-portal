/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'architectureacademics.local',
      },
      {
        protocol: 'https',
        hostname: '*.architectureacademics.com',
      },
      {
        protocol: 'https',
        hostname: 'architectureacademics.online',
      },
      {
        protocol: 'https',
        hostname: '*.architectureacademics.online',
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
              value: 'courses.architectureacademics.online',
            },
          ],
          destination: '/courses/:path*',
        },
        {
          source: '/:path*',
          has: [
            {
              type: 'host',
              value: 'jobs.architectureacademics.online',
            },
          ],
          destination: '/jobs-portal/:path*',
        },
        {
          source: '/:path*',
          has: [
            {
              type: 'host',
              value: 'events.architectureacademics.online',
            },
          ],
          destination: '/events/:path*',
        },
        {
          source: '/:path*',
          has: [
            {
              type: 'host',
              value: 'workshops.architectureacademics.online',
            },
          ],
          destination: '/workshops/:path*',
        },
        {
          source: '/:path*',
          has: [
            {
              type: 'host',
              value: 'blogs.architectureacademics.online',
            },
          ],
          destination: '/blogs/:path*',
        },
        {
          source: '/:path*',
          has: [
            {
              type: 'host',
              value: 'discussions.architectureacademics.online',
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
              value: 'courses.architectureacademics.local',
            },
          ],
          destination: '/courses/:path*',
        },
        {
          source: '/:path*',
          has: [
            {
              type: 'host',
              value: 'jobs.architectureacademics.local',
            },
          ],
          destination: '/jobs-portal/:path*',
        },
        {
          source: '/:path*',
          has: [
            {
              type: 'host',
              value: 'events.architectureacademics.local',
            },
          ],
          destination: '/events/:path*',
        },
        {
          source: '/:path*',
          has: [
            {
              type: 'host',
              value: 'workshops.architectureacademics.local',
            },
          ],
          destination: '/workshops/:path*',
        },
        {
          source: '/:path*',
          has: [
            {
              type: 'host',
              value: 'blogs.architectureacademics.local',
            },
          ],
          destination: '/blogs/:path*',
        },
        {
          source: '/:path*',
          has: [
            {
              type: 'host',
              value: 'discussions.architectureacademics.local',
            },
          ],
          destination: '/discussions/:path*',
        },
      ],
    }
  },
}

export default nextConfig
