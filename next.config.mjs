/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: process.env.NEXT_PUBLIC_SUPABASE_URL
      ? [
          {
            protocol: 'https',
            hostname: new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname,
            port: '',
            pathname: '/storage/v1/object/public/immagini/**',
          },
        ]
      : [],
  },
};

export default nextConfig;
