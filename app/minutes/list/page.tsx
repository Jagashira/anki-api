// app/minutes/list/page.tsx
"use client";

import { useEffect, useState } from "react";
import { getAllMinutes } from "@/lib/minutes/getAll";
import Link from "next/link";
import { deleteMinutes } from "@/lib/minutes/delete";

type Minutes = {
  id: string;
  summary: string;
  prompt: string;
  createdAt?: { seconds: number }; // Firestore Timestamp
};

export default function MinutesListPage() {
  const [minutes, setMinutes] = useState<Minutes[]>([]);
  const handleDelete = async (id: string) => {
    const confirmDelete = confirm("この議事録を削除しますか？");
    if (!confirmDelete) return;

    await deleteMinutes(id);
    setMinutes((prev) => prev.filter((m) => m.id !== id));
  };

  useEffect(() => {
    (async () => {
      const data = await getAllMinutes();
      setMinutes(data);
    })();
  }, []);

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold mb-4">📄 保存済み議事録一覧</h1>
      {minutes.length === 0 ? (
        <p className="text-gray-500">保存された議事録はまだありません。</p>
      ) : (
        <ul className="space-y-3">
          {minutes.map((item) => (
            <li
              key={item.id}
              className="p-4 border rounded bg-white shadow-sm transition hover:shadow-lg cursor-pointer"
            >
              <div className="text-sm text-gray-500">
                {item.createdAt
                  ? new Date(item.createdAt.seconds * 1000).toLocaleString()
                  : "日時不明"}
              </div>
              <div className="font-semibold">{item.prompt}</div>
              <p className="text-gray-700 text-sm line-clamp-2 mt-1">
                {item.summary.slice(0, 100)}...
              </p>
              <Link
                href={`/minutes/${item.id}`}
                className="text-blue-600 hover:underline"
              >
                ▶ 詳細を見る
              </Link>
              <button
                onClick={() => handleDelete(item.id)}
                className="text-red-500 text-sm hover:underline"
              >
                🗑️ 削除
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
