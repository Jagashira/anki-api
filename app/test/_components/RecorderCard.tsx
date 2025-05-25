// app/components/RecorderCard.tsx
"use client";

import React from "react";

interface RecorderCardProps {
  isRecording: boolean;
  elapsedTime: number;
  prompt: string;
  chunkDuration: number;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onPromptChange: (newPrompt: string) => void;
  onChunkDurationChange: (newDuration: number) => void;
  isProcessing: boolean; // API通信中など、他の操作を無効化したい場合
}

const RecorderCard: React.FC<RecorderCardProps> = ({
  isRecording,
  elapsedTime,
  prompt,
  chunkDuration,
  onStartRecording,
  onStopRecording,
  onPromptChange,
  onChunkDurationChange,
  isProcessing,
}) => {
  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
      2,
      "0"
    )}`;
  };

  return (
    <div
      style={{
        border: "1px solid #ccc",
        borderRadius: "8px",
        padding: "20px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        marginBottom: "20px",
      }}
    >
      <h2
        style={{
          marginTop: 0,
          borderBottom: "1px solid #eee",
          paddingBottom: "10px",
        }}
      >
        録音コントロール
      </h2>
      <div style={{ marginBottom: "15px" }}>
        <button
          onClick={isRecording ? onStopRecording : onStartRecording}
          disabled={isProcessing && !isRecording} // 録音開始は他の処理中でも可能にするか検討。停止は録音中のみ。
          style={{
            padding: "12px 20px",
            fontSize: "1rem",
            borderRadius: "4px",
            border: "none",
            color: "white",
            background: isRecording ? "#dc3545" : "#007bff",
            cursor: "pointer",
            marginRight: "10px",
          }}
        >
          {isRecording ? "録音停止" : "録音開始"}
        </button>
        <span style={{ fontSize: "1.2rem", fontWeight: "bold" }}>
          {formatTime(elapsedTime)}
        </span>
      </div>

      <div style={{ marginBottom: "15px" }}>
        <label
          htmlFor="chunkDuration"
          style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}
        >
          録音チャンク時間 (秒):
        </label>
        <input
          type="number"
          id="chunkDuration"
          value={chunkDuration}
          onChange={(e) =>
            onChunkDurationChange(Math.max(1, parseInt(e.target.value, 10)))
          } // 1秒未満は不可
          disabled={isRecording || isProcessing}
          min="1"
          max="60" // 適切に上限を設定
          style={{
            padding: "8px",
            borderRadius: "4px",
            border: "1px solid #ccc",
            width: "80px",
          }}
        />
      </div>

      <div>
        <label
          htmlFor="prompt"
          style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}
        >
          要約用プロンプト:
        </label>
        <textarea
          id="prompt"
          value={prompt}
          onChange={(e) => onPromptChange(e.target.value)}
          rows={4}
          disabled={isRecording || isProcessing}
          placeholder="例: 会議の主要な決定事項とアクションアイテムを簡潔にまとめてください。"
          style={{
            width: "100%",
            padding: "10px",
            borderRadius: "4px",
            border: "1px solid #ccc",
            boxSizing: "border-box",
          }}
        />
      </div>
    </div>
  );
};

export default RecorderCard;
