import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "gwiosfzavq.ufs.sh",
        pathname: "/f/*",
      },
    ],
  },
};

export default nextConfig;
