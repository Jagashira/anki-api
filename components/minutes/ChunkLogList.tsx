"use client";

import { FaSpinner } from "react-icons/fa";

type ChunkLog = {
  id: number;
  status: "sending" | "success" | "error";
  text?: string;
  error?: string;
};

export default function ChunkLogList({ logs }: { logs: ChunkLog[] }) {
  return (
    <section className="mt-6 space-y-4">
      <h2 className="text-lg font-bold">📦 チャンクログ</h2>

      {logs.map((log) => (
        <div
          key={log.id}
          className="p-4 rounded-md border shadow-sm bg-white space-y-2"
        >
          {/* ヘッダー */}
          <div className="flex justify-between items-center">
            <div className="font-semibold text-gray-800">🧩 Chunk {log.id}</div>

            <span
              className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded ${
                log.status === "success"
                  ? "bg-green-100 text-green-800"
                  : log.status === "error"
                  ? "bg-red-100 text-red-800"
                  : "bg-yellow-100 text-yellow-800"
              }`}
            >
              {log.status === "sending" && (
                <>
                  <FaSpinner className="animate-spin" />
                  送信中...
                </>
              )}
              {log.status === "success" && "✅ 成功"}
              {log.status === "error" && "❌ エラー"}
            </span>
          </div>

          {/* テキスト or エラー */}
          {log.text && (
            <div className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 p-2 rounded border">
              {log.text}
            </div>
          )}

          {log.error && (
            <div className="text-sm text-red-600">⚠️ {log.error}</div>
          )}
        </div>
      ))}
    </section>
  );
}
