import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Optimize for production
  experimental: {
    optimizePackageImports: ['lucide-react']
  },
  
  // Server configuration for larger payloads
  serverRuntimeConfig: {
    maxDuration: 30,
  },
  
  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'freelance-store.s3.ap-southeast-1.amazonaws.com',
        port: '',
        pathname: '/sistabag/**',
      },
    ],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;"
  },
  
  // Environment variables
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  
  // ESLint configuration for build
  eslint: {
    ignoreDuringBuilds: true
  },
  
  // TypeScript configuration for build
  typescript: {
    ignoreBuildErrors: false
  },
  
  // Output configuration for Vercel
  output: 'standalone',
  
  // Disable x-powered-by header
  poweredByHeader: false,
  
  // Compress responses
  compress: true,
  
  // Trailing slash configuration
  trailingSlash: false
};

export default nextConfig;
