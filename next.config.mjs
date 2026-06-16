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
  },
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "happyathomepets.co.uk",
          },
        ],
        destination: "https://www.happyathomepets.co.uk/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
