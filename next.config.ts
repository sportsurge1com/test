
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // images: { // Image configuration removed
  //   remotePatterns: [
  //     {
  //       protocol: 'https',
  //       hostname: 'placehold.co',
  //       port: '',
  //       pathname: '/**',
  //     },
  //     {
  //       protocol: 'https',
  //       hostname: 'a.espncdn.com', // Added for ESPN images
  //       port: '',
  //       pathname: '/**',
  //     },
  //     {
  //       protocol: 'http', // If ESPN sometimes uses http for logos
  //       hostname: 'a.espncdn.com',
  //       port: '',
  //       pathname: '/**',
  //     },
  //     {
  //       protocol: 'https',
  //       hostname: 'imagecache.365scores.com', // Added for 365scores images
  //       port: '',
  //       pathname: '/**',
  //     }
  //   ],
  // },
};

export default nextConfig;
