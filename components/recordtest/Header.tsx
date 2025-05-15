// components/Header.tsx
"use client";

import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white shadow px-6 py-3 flex justify-between items-center">
      <div className="font-bold text-xl text-blue-600">🧠 議事録くん</div>
      <nav className="space-x-4 text-sm font-medium text-gray-700">
        <Link href="/recorder/list" className="hover:text-blue-600">
          📄 議事録一覧
        </Link>
        <Link href="/recorder/usage" className="hover:text-blue-600">
          📊 使用量
        </Link>
        <Link href="/recorder/setting" className="hover:text-blue-600">
          ⚙️ 設定
        </Link>
      </nav>
    </header>
  );
}
