"use client";

import { useState } from "react";

type Props = {
  summary: string;
  onRetry?: () => void;
  onSave?: () => Promise<void>;
  disabled?: boolean;
};

export default function SummaryCard({
  summary,
  onRetry,
  onSave,
  disabled,
}: Props) {
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);

  const handleTxtDownload = () => {
    const blob = new Blob([summary], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "summary.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleSave = async () => {
    if (!onSave) return;
    setSaving(true);
    setSavedMsg(null);
    try {
      await onSave();
      setSavedMsg("☁️ クラウドに保存しました");
    } catch {
      setSavedMsg("❌ 保存に失敗しました");
    } finally {
      setSaving(false);
      setTimeout(() => setSavedMsg(null), 3000);
    }
  };

  return (
    <section className="mt-8 p-6 rounded-md bg-white border shadow space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold">📋 GPTによる要約</h2>
        <button
          onClick={onRetry}
          className="text-sm text-blue-600 hover:underline"
        >
          🔁 再要約
        </button>
      </div>

      <div className="whitespace-pre-wrap text-gray-800 text-sm bg-gray-50 p-3 rounded border">
        {summary}
      </div>

      <div className="flex flex-wrap justify-end gap-2">
        <button
          onClick={handleCopy}
          className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded"
        >
          📋 コピー
        </button>
        <button
          onClick={handleTxtDownload}
          className="px-3 py-1 text-sm bg-green-600 hover:bg-green-700 text-white rounded"
        >
          💾 保存（.txt）
        </button>
        <button
          onClick={handleSave}
          disabled={saving || disabled}
          className={`px-3 py-1 text-sm text-white rounded transition
    ${
      saving
        ? "bg-blue-400"
        : disabled
        ? "bg-gray-400 cursor-not-allowed"
        : "bg-blue-600 hover:bg-blue-700"
    }`}
        >
          {saving
            ? "⏳ 保存中…"
            : disabled
            ? "✅ クラウド保存済み"
            : "☁️ クラウド保存"}
        </button>
      </div>

      {copied && (
        <div className="text-right text-xs text-green-600">
          ✅ コピーしました
        </div>
      )}
      {savedMsg && (
        <div className="text-right text-xs text-blue-600">{savedMsg}</div>
      )}
    </section>
  );
}
