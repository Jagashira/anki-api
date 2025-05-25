// app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Layout/Header";
import Footer from "@/components/Layout/Footer";

const inter = Inter({ subsets: ["latin"] }); // フォントの例

export const metadata: Metadata = {
  title: "議事録アプリ | Whisper & ChatGPT活用",
  description:
    "AIが音声からテキスト化し、要約まで行う高効率な議事録作成アプリケーションです。",
  icons: {
    icon: "/icon.png", // publicフォルダに配置したfavicon (例: 32x32 PNG)
    apple: "/apple-icon.png", // publicフォルダに配置 (推奨: 180x180 PNG)
  },
  openGraph: {
    title: "議事録アプリ | Whisper & ChatGPT活用",
    description:
      "AIが音声からテキスト化し、要約まで行う高効率な議事録作成アプリケーションです。",
    images: [
      {
        url: "/og-image.png", // publicフォルダに配置 (推奨: 1200x630 PNG)
        width: 1200,
        height: 630,
        alt: "議事録アプリ - AIによる音声テキスト化と要約",
      },
    ],
    locale: "ja_JP",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "議事録アプリ | Whisper & ChatGPT活用",
    description:
      "AIが音声からテキスト化し、要約まで行う高効率な議事録作成アプリケーションです。",
    images: ["/og-image.png"], // Open Graphと同じ画像で良い場合
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={inter.className}
        style={{
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
          margin: 0,
        }}
      >
        <Header />
        <main
          style={{
            flexGrow: 1,
            padding: "1rem 2rem" /* メインコンテンツのパディング */,
          }}
        >
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
