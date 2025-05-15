"use client";

type Props = {
  summary: string;
  onRetry?: () => void;
  onSave?: () => void;
};

export default function SummaryCard({ summary, onRetry, onSave }: Props) {
  return (
    <section className="mt-8 p-6 rounded-md bg-white border shadow space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold">📋 GPTによる要約</h2>
        <button
          onClick={onRetry}
          className="text-sm text-blue-600 hover:underline"
        >
          🔁 再要約
        </button>
      </div>

      <div className="whitespace-pre-wrap text-gray-800 text-sm bg-gray-50 p-3 rounded border">
        {summary}
      </div>

      <div className="text-right">
        <button
          onClick={onSave}
          className="px-3 py-1 text-sm bg-green-600 hover:bg-green-700 text-white rounded"
        >
          💾 保存
        </button>
      </div>
    </section>
  );
}
