// app/minutes/setting/page.tsx
"use client";

export default function SettingsPage() {
  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">⚙️ アプリ設定</h1>

      {/* 🧠 プロンプト設定カード */}
      <section className="bg-white shadow border rounded p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-800">
          🧠 よく使うプロンプト
        </h2>
        <p className="text-sm text-gray-500">
          録音時に使う要約プロンプトを編集できます。
        </p>

        {/* ここに PromptEditor コンポーネント（後で作成）を挿入 */}
      </section>

      {/* 🛠️ その他の設定カード（拡張用） */}
      <section className="bg-white shadow border rounded p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-800">🛠️ その他の設定</h2>
        <p className="text-sm text-gray-500">
          今後、録音設定や表示設定などをここに追加します。
        </p>

        {/* 例: チャンク長の初期値や自動保存設定など */}
        <div className="text-gray-400 italic text-sm">（準備中）</div>
      </section>
    </div>
  );
}
