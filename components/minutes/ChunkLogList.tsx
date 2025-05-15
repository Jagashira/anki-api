"use client";

type ChunkLog = {
  id: number;
  status: "sending" | "success" | "error";
  text?: string;
  error?: string;
};

export default function ChunkLogList({ logs }: { logs: ChunkLog[] }) {
  return (
    <section className="mt-6">
      <h2 className="text-lg font-semibold mb-2">📦 チャンクログ</h2>
      <ul className="space-y-3">
        {logs.map((log) => (
          <li
            key={log.id}
            className={`p-3 border rounded shadow-sm ${
              log.status === "success"
                ? "bg-green-50 border-green-300"
                : log.status === "error"
                ? "bg-red-50 border-red-300"
                : "bg-yellow-50 border-yellow-300"
            }`}
          >
            <div className="font-semibold">Chunk {log.id}</div>
            {log.status === "sending" && <div>⏳ 送信中...</div>}
            {log.status === "success" && <div>✅ 成功</div>}
            {log.status === "error" && <div>❌ エラー: {log.error}</div>}
            {log.text && (
              <div className="mt-2 text-sm whitespace-pre-wrap text-gray-700">
                {log.text}
              </div>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
