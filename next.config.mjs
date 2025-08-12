/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
      remotePatterns: [
        {
          protocol: "https",
          hostname: "xmiaatzxskmuxyzsvyjn.supabase.co",
          port: "",
          pathname: "/storage/v1/object/public/immagini/**",
        },
      ],
    },
  };
  
  export default nextConfig;