// app/components/ChunkLogList.tsx
"use client";

import React from "react";

export interface TranscribedChunk {
  id: string;
  text: string | null;
  status: "pending" | "sending" | "success" | "error";
  timestamp: number; // チャンク開始時刻など、識別のために
}

interface ChunkLogListProps {
  chunks: TranscribedChunk[];
}

const ChunkLogList: React.FC<ChunkLogListProps> = ({ chunks }) => {
  if (chunks.length === 0) {
    return (
      <p style={{ color: "#666" }}>
        録音を開始すると、ここにテキスト化された内容が表示されます。
      </p>
    );
  }

  return (
    <div
      style={{
        maxHeight: "300px",
        overflowY: "auto",
        border: "1px solid #eee",
        padding: "10px",
        borderRadius: "4px",
        background: "#f9f9f9",
      }}
    >
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {chunks.map((chunk, index) => (
          <li
            key={chunk.id}
            style={{
              marginBottom: "8px",
              paddingBottom: "8px",
              borderBottom:
                index < chunks.length - 1 ? "1px dashed #ddd" : "none",
            }}
          >
            <div style={{ fontSize: "0.8em", color: "#888" }}>
              チャンク {index + 1} (ステータス: {getStatusText(chunk.status)})
            </div>
            <p style={{ margin: "4px 0", whiteSpace: "pre-wrap" }}>
              {chunk.text ||
                (chunk.status === "sending"
                  ? "テキスト化中..."
                  : chunk.status === "error"
                  ? "エラーが発生しました"
                  : "音声データ受信待ち...")}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
};

const getStatusText = (status: TranscribedChunk["status"]) => {
  switch (status) {
    case "pending":
      return "待機中";
    case "sending":
      return "送信中";
    case "success":
      return "成功";
    case "error":
      return "エラー";
    default:
      return "";
  }
};

export default ChunkLogList;
