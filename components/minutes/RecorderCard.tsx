"use client";

import WaveformVisualizer from "./WaveformVisualizer";
import PromptSelector from "./PromptSelector";
import { PromptPreview } from "./PromptPreview";
import { BsMicFill, BsStopFill } from "react-icons/bs";

type Props = {
  recording: boolean;
  elapsed: number;
  prompt: string;
  stream: MediaStream | null;
  onToggle: () => void;
  onPromptChange: (value: string) => void;
};

export default function RecorderCard({
  recording,
  elapsed,
  prompt,
  stream,
  onToggle,
  onPromptChange,
}: Props) {
  const formatTime = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(
      2,
      "0"
    )}`;

  return (
    <div className="bg-white shadow rounded p-6 space-y-6">
      {/* 🎙 ボタン */}
      <div className="flex justify-center">
        <button
          onClick={onToggle}
          className={`w-24 h-24 rounded-full flex items-center justify-center shadow-lg transition duration-300 ${
            recording
              ? "bg-red-600 animate-pulse"
              : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {recording ? (
            <BsStopFill className="text-white text-3xl" />
          ) : (
            <BsMicFill className="text-white text-3xl" />
          )}
        </button>
      </div>

      {/* 📜 プロンプト選択 */}
      <PromptSelector prompt={prompt} onChange={onPromptChange} />
      <PromptPreview prompt={prompt} />

      {/* ⏱ 時間 */}
      <div className="text-center text-gray-500 font-mono text-lg">
        ⏱ {formatTime(elapsed)}
      </div>

      {/* 📈 波形 or 停止メッセージ */}
      {recording ? (
        <WaveformVisualizer stream={stream} active={recording} />
      ) : (
        <div className="w-full h-16 flex items-center justify-center text-sm text-gray-500 bg-gray-100 rounded border">
          ⏹️ 録音は停止中です
        </div>
      )}
    </div>
  );
}
