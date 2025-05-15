// components/minutes/PromptSelector.tsx
"use client";

import { useEffect, useState } from "react";

type Props = {
  prompt: string;
  onChange: (value: string) => void;
};
type Prompt = {
  id: string;
  label: string;
  text: string;
};

export default function PromptSelector({ prompt, onChange }: Props) {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [mode, setMode] = useState<"preset" | "custom">("preset");

  useEffect(() => {
    const fetchPrompts = async () => {
      const res = await fetch("/api/prompts");
      const data = await res.json();
      setPrompts(data || []);
    };
    fetchPrompts();
  }, []);

  const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === "custom") {
      setMode("custom");
      onChange("");
    } else {
      const selected = prompts.find((p) => p.id === value);
      if (selected) {
        setMode("preset");
        onChange(selected.text);
      }
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-gray-700">
        📜 プロンプト
      </label>
      <select
        className="w-full border rounded px-3 py-2 text-sm"
        onChange={handleSelect}
        value={
          mode === "custom"
            ? "custom"
            : prompts.find((p) => p.text === prompt)?.id || "custom"
        }
      >
        {prompts.map((p) => (
          <option key={p.id} value={p.id}>
            {p.label}
          </option>
        ))}
        <option value="custom">✏️ カスタム入力</option>
      </select>

      {mode === "custom" && (
        <textarea
          className="w-full border rounded px-3 py-2 text-sm mt-2"
          rows={3}
          value={prompt}
          onChange={(e) => onChange(e.target.value)}
          placeholder="プロンプトを自由に入力..."
        />
      )}
    </div>
  );
}
