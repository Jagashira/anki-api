import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverComponentsExternalPackages: [
      "fluent-ffmpeg",
      "@ffmpeg-installer/ffmpeg",
    ],
    esmExternals: "loose",
  },
  webpack: (config) => {
    // 'canvas'と'encoding'モジュールのエイリアスを無効化
    config.resolve.alias.canvas = false;
    config.resolve.alias.encoding = false;
    return config;
  },
  transpilePackages: ["@react-pdf/renderer"],
};
/* config options here */

export default nextConfig;
