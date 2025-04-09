"use client";

import { useState } from "react";

export default function HomePage() {
  const [message, setMessage] = useState("");

  const handleAddNote = async () => {
    const res = await fetch("/api/add-note", { method: "POST" });
    const data = await res.json();
    if (res.ok) {
      setMessage("✅ " + data.message);
    } else {
      setMessage("❌ Error: " + data.error);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Anki ノート追加</h1>
      <button
        onClick={handleAddNote}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        ノートを追加
      </button>
      {message && <p className="mt-4">{message}</p>}
    </div>
  );
}
