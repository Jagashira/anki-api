// app/components/SummaryCard.tsx
"use client";

import React from "react";

interface SummaryCardProps {
  summary: string;
  isLoadingSummary: boolean;
  isSaving: boolean;
  onRetrySummary: () => void;
  onSaveMeeting: () => void;
  canSave: boolean; // 要約があり、保存中でない場合にtrue
}

const SummaryCard: React.FC<SummaryCardProps> = ({
  summary,
  isLoadingSummary,
  isSaving,
  onRetrySummary,
  onSaveMeeting,
  canSave,
}) => {
  return (
    <div
      style={{
        border: "1px solid #ccc",
        borderRadius: "8px",
        padding: "20px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      }}
    >
      <h2
        style={{
          marginTop: 0,
          borderBottom: "1px solid #eee",
          paddingBottom: "10px",
        }}
      >
        要約結果
      </h2>
      {isLoadingSummary ? (
        <p>要約を生成中です...</p>
      ) : summary ? (
        <div
          style={{
            whiteSpace: "pre-wrap",
            maxHeight: "400px",
            overflowY: "auto",
            padding: "10px",
            background: "#f9f9f9",
            borderRadius: "4px",
          }}
        >
          {summary}
        </div>
      ) : (
        <p style={{ color: "#666" }}>
          録音を停止すると、ここに要約が表示されます。
        </p>
      )}
      <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
        <button
          onClick={onRetrySummary}
          disabled={isLoadingSummary || isSaving || !summary} // 要約がない場合や処理中は無効
          style={{
            padding: "10px 15px",
            borderRadius: "4px",
            border: "1px solid #007bff",
            color: "#007bff",
            background: "white",
            cursor: "pointer",
          }}
        >
          再試行
        </button>
        <button
          onClick={onSaveMeeting}
          disabled={!canSave || isSaving || isLoadingSummary}
          style={{
            padding: "10px 15px",
            borderRadius: "4px",
            border: "none",
            color: "white",
            background: "#28a745",
            cursor: "pointer",
          }}
        >
          {isSaving ? "保存中..." : "議事録を保存"}
        </button>
      </div>
    </div>
  );
};

export default SummaryCard;
