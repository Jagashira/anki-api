// app/minutes/[id]/page.tsx
import { getMinutesById } from "@/lib/minutes/getById";
import { notFound } from "next/navigation";

type Props = {
  params: { id: string };
};

export default async function MinutesDetailPage({ params }: Props) {
  const minutes = await getMinutesById(params.id);

  if (!minutes) return notFound();

  const formattedDate = minutes.createdAt
    ? new Date(minutes.createdAt.seconds * 1000).toLocaleString()
    : "日時不明";

  // ✅ ここで全文を結合（text のみを対象に）
  const fullText = minutes.logs
    .filter((log) => log.text)
    .map((log) => log.text)
    .join("\n");

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">📄 議事録詳細</h1>

      <div className="text-sm text-gray-500">作成日時: {formattedDate}</div>
      <div className="font-semibold text-gray-700">
        🧠 プロンプト: {minutes.prompt}
      </div>

      {/* 📋 GPT要約 */}
      <section className="mt-6">
        <h2 className="text-lg font-bold mb-2">📋 GPTによる要約</h2>
        <div className="whitespace-pre-wrap bg-gray-100 p-3 rounded text-sm text-gray-800 border">
          {minutes.summary}
        </div>
      </section>

      {/* 🧾 チャンク全文結合 */}
      <section className="mt-6">
        <h2 className="text-lg font-bold mb-2">
          🧾 文字起こし全文（チャンク統合）
        </h2>
        <div className="whitespace-pre-wrap bg-white p-3 rounded text-sm text-gray-800 border border-gray-300">
          {fullText || "（文字起こしがありません）"}
        </div>
      </section>

      {/* 📦 チャンクログ */}
      <section className="mt-6">
        <h2 className="text-lg font-bold mb-2">📦 チャンクログ</h2>
        <ul className="space-y-3">
          {minutes.logs.map((log) => (
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
    </div>
  );
}
