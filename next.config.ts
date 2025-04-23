import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  webpack(config, { isServer }) {
    // もしサーバー側でのみ動作する設定を追加する場合
    if (isServer) {
      config.node = {
        fs: "empty", // 'fs' モジュールに依存する場合、この設定を追加
      };
    }
    config.module.rules.push({
      test: /\.md$/,
      use: "ignore-loader", // .md ファイルを無視
    });
    return config;
  },
  api: {
    bodyParser: false, // ボディパーサーを無効化して、カスタムなパーサーを使用
  },
};

export default nextConfig;
