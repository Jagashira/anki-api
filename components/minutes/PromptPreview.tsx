import { useState } from "react";
import { HiOutlineClipboard } from "react-icons/hi2";

export function PromptPreview({ prompt }: { prompt: string }) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const maxLength = 50;

  const resolvePromptText = () => {
    if (!prompt.trim()) return "（プロンプト未入力）";

    return prompt === "default"
      ? "この会話を標準的な要約形式で整理してください。"
      : prompt === "detailed"
      ? "詳細にわたって内容を記録してください。"
      : prompt === "action"
      ? "この会議の議事内容を要約してください。参加者の発言や議論の流れを時系列に沿って整理し、重要な決定事項・未解決の課題・アクションアイテムを明確に箇条書きで記述してください。不要なあいまいな表現や雑談は省略し、要点に集中した内容にしてください。"
      : prompt;
  };

  const text = resolvePromptText();
  const displayText =
    !expanded && text.length > maxLength
      ? text.slice(0, maxLength) + "..."
      : text;

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation(); // ← 展開クリックと競合しないように
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div
      onClick={() => setExpanded((prev) => !prev)}
      className="relative bg-gray-50 border border-gray-200 rounded-md p-3 text-sm text-gray-700 whitespace-pre-wrap cursor-pointer select-none hover:bg-gray-100 transition"
    >
      {/* 📋 コピーボタン（右上） */}
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 text-gray-400 hover:text-blue-500"
        title="プロンプトをコピー"
      >
        <HiOutlineClipboard className="w-5 h-5" />
      </button>

      <div className="font-semibold mb-1 text-gray-600">
        🧠 現在のプロンプト：
      </div>
      <div>{displayText}</div>

      {text.length > 200 && (
        <div className="mt-1 text-xs text-blue-500">
          {expanded ? "（クリックで折りたたみ）" : "（クリックで全文表示）"}
        </div>
      )}

      {copied && (
        <div className="absolute top-2 right-10 text-xs text-green-600 animate-pulse">
          ✅ コピー済み
        </div>
      )}
    </div>
  );
}
