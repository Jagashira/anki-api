// app/minutes/usage/page.tsx
import { getUsageSummary } from "@/lib/minutes/usage";

export default async function UsagePage() {
  const { whisperChunks, gptCalls, tokens, estimatedCostYen } =
    await getUsageSummary();

  return (
    <div className="p-6 max-w-xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold mb-4">📊 使用量サマリ</h1>

      <div className="bg-white shadow p-4 rounded border space-y-3 text-sm">
        <div>
          🔊 Whisper 使用チャンク数: <strong>{whisperChunks}</strong> 回
        </div>
        <div>
          🧠 GPT 要約回数: <strong>{gptCalls}</strong> 回
        </div>
        <div>
          📈 推定トークン使用量: <strong>{tokens}</strong> tokens
        </div>
        <div>
          💰 推定コスト: <strong>{estimatedCostYen} 円</strong>
        </div>
      </div>
    </div>
  );
}
