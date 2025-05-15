"use client";

import { useState } from "react";

export type Prompt = {
  id: string;
  label: string;
  text: string;
};

type Props = {
  initialPrompts: Prompt[];
  onSave: (prompts: Prompt[]) => Promise<void>;
};

export default function PromptEditor({ initialPrompts, onSave }: Props) {
  const [prompts, setPrompts] = useState<Prompt[]>(initialPrompts);
  const [newLabel, setNewLabel] = useState("");
  const [newText, setNewText] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleAdd = async () => {
    if (!newLabel.trim() || !newText.trim()) {
      setMessage("❌ 名前と本文を入力してください");
      return;
    }

    const newPrompt: Prompt = {
      id: Date.now().toString(),
      label: newLabel.trim(),
      text: newText.trim(),
    };

    const updated = [...prompts, newPrompt];
    setPrompts(updated);
    setNewLabel("");
    setNewText("");
    await save(updated);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("このプロンプトを削除しますか？")) return;
    const updated = prompts.filter((p) => p.id !== id);
    setPrompts(updated);
    await save(updated);
  };

  const handleEditChange = (
    id: string,
    field: "label" | "text",
    value: string
  ) => {
    setPrompts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  const handleEditSave = async (id: string) => {
    setEditId(null);
    await save(prompts);
  };

  const handleEditCancel = (id: string) => {
    // 再取得し直す or 最初の状態に戻す（今回は初期状態のままに）
    const original = initialPrompts.find((p) => p.id === id);
    if (original) {
      setPrompts((prev) => prev.map((p) => (p.id === id ? original : p)));
    }
    setEditId(null);
  };

  const save = async (data: Prompt[]) => {
    setSaving(true);
    setMessage(null);
    try {
      await onSave(data);
      setMessage("✅ 保存しました");
    } catch {
      setMessage("❌ 保存に失敗しました");
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  return (
    <div className="space-y-6">
      {/* 🔸 保存済みプロンプト一覧 */}
      {prompts.map((p) => {
        const isEditing = editId === p.id;

        return (
          <div
            key={p.id}
            className="border rounded p-4 bg-gray-50 space-y-2 shadow-sm"
          >
            {isEditing ? (
              <>
                <input
                  value={p.label}
                  onChange={(e) =>
                    handleEditChange(p.id, "label", e.target.value)
                  }
                  className="w-full border px-2 py-1 text-sm rounded placeholder-gray-400"
                  placeholder="プロンプトの名前を入力..."
                />
                <textarea
                  value={p.text}
                  onChange={(e) =>
                    handleEditChange(p.id, "text", e.target.value)
                  }
                  className="w-full border px-2 py-1 text-sm rounded resize-y placeholder-gray-400"
                  rows={3}
                  placeholder="プロンプトの本文を入力..."
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => handleEditCancel(p.id)}
                    className="text-sm text-gray-500 hover:underline"
                  >
                    ❌ キャンセル
                  </button>
                  <button
                    onClick={() => handleEditSave(p.id)}
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    ✅ 保存
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="flex justify-between items-center">
                  <div className="text-sm font-semibold text-gray-700">
                    {p.label}
                  </div>
                  <div className="flex gap-2 text-xs">
                    <button
                      onClick={() => setEditId(p.id)}
                      className="text-blue-600 hover:underline"
                    >
                      ✏️ 編集
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="text-red-500 hover:underline"
                    >
                      🗑️ 削除
                    </button>
                  </div>
                </div>
                <div className="text-sm text-gray-600 whitespace-pre-wrap">
                  {p.text}
                </div>
              </>
            )}
          </div>
        );
      })}

      {/* 🔹 新規プロンプト追加 */}
      <div className="border rounded p-4 bg-white shadow space-y-3">
        <h3 className="text-sm font-semibold text-gray-800">
          ➕ 新しいプロンプト
        </h3>
        <input
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
          placeholder="プロンプトの名前を入力..."
          className="w-full border rounded px-2 py-1 text-sm placeholder-gray-400"
        />
        <textarea
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          rows={3}
          placeholder="プロンプトの本文を入力..."
          className="w-full border rounded px-2 py-1 text-sm resize-y placeholder-gray-400"
        />
        <div className="text-right">
          <button
            onClick={handleAdd}
            disabled={saving}
            className="px-4 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? "保存中…" : "💾 保存"}
          </button>
        </div>
        {message && (
          <div
            className={`text-sm text-right ${
              message.startsWith("✅")
                ? "text-green-600"
                : message.startsWith("❌")
                ? "text-red-600"
                : "text-blue-600"
            }`}
          >
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
