"use client";

import { useState } from "react";

type Props = {
  prompt: string;
  onChange: (value: string) => void;
};

export default function PromptSelector({ prompt, onChange }: Props) {
  const [mode, setMode] = useState<"preset" | "custom">(
    prompt === "custom" ? "custom" : "preset"
  );

  const handlePresetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setMode(value === "custom" ? "custom" : "preset");
    onChange(value === "custom" ? "" : value);
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-semibold text-gray-700">
        📜 プロンプト
      </label>

      <select
        value={mode === "custom" ? "custom" : prompt}
        onChange={handlePresetChange}
        className="w-full border border-gray-300 rounded-md px-4 py-2 shadow-sm bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="default">標準的な要約</option>
        <option value="detailed">詳細な記録</option>
        <option value="action">TODO抽出</option>
        <option value="custom">✏️ カスタムプロンプトを入力</option>
      </select>

      {mode === "custom" && (
        <textarea
          className="w-full border border-gray-300 rounded-md px-4 py-2 min-h-[100px] shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="例）この会議では、アクションアイテムと決定事項を明確に整理してください。"
          value={prompt}
          onChange={handleCustomChange}
        />
      )}
    </div>
  );
}
