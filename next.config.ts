import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverComponentsExternalPackages: [
      "fluent-ffmpeg",
      "@ffmpeg-installer/ffmpeg",
    ],
  },
};
/* config options here */

export default nextConfig;
