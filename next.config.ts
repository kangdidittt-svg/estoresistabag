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
    domains: ['res.cloudinary.com', 'localhost'],
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
