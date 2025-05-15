// app/record/layout.tsx

import Footer from "@/components/recordtest/Footer";
import Header from "@/components/recordtest/Header";

export const metadata = {
  title: "議事録くん",
  description: "Whisper + ChatGPTで議事録自動生成アプリ",
};

export default function RecordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <Header />
      <main className="max-w-4xl mx-auto px-4 pt-6 pb-20">{children}</main>
      <Footer />
    </div>
  );
}
