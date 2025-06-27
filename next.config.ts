import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // APIルートにマッチ
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          // 許可するオリジン（あなたの拡張機能IDとローカル開発環境）
          {
            key: "Access-Control-Allow-Origin",
            value:
              "chrome-extension://ooigjceiiklimnhblplokmpkopjliman, http://localhost:5173",
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET,DELETE,PATCH,POST,PUT",
          },
          {
            key: "Access-Control-Allow-Headers",
            value:
              "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version",
          },
        ],
      },
    ];
  },
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
