"use client";

import { useState } from "react";

export default function HomePage() {
  const [word, setWord] = useState("");
  const [message, setMessage] = useState("");
  const [result, setResult] = useState("");

  const handleAddWord = async () => {
    const res = await fetch("/api/add-note", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ word }),
    });

    const data = await res.json();

    if (res.ok) {
      setMessage("✅ " + data.message);
      setResult(data.content);
    } else {
      setMessage("❌ " + data.error);
      setResult("");
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">
        英単語 → ChatGPT解説 → Anki追加
      </h1>
      <input
        className="w-full p-2 border rounded mb-2"
        placeholder="例: parse"
        value={word}
        onChange={(e) => setWord(e.target.value)}
      />
      <button
        onClick={handleAddWord}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
      >
        ChatGPTで生成してAnkiに追加
      </button>
      {message && <p className="mt-4">{message}</p>}
      {result && (
        <div className="mt-4 p-3 bg-gray-100 rounded">
          <strong>生成された内容:</strong>
          <pre className="whitespace-pre-wrap">{result}</pre>
        </div>
      )}
    </div>
  );
}
