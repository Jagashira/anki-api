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
  chunkDuration: number;
  onToggle: () => void;
  onPromptChange: (value: string) => void;
  onChunkDurationChange: (value: number) => void;
};

export default function RecorderCard({
  recording,
  elapsed,
  prompt,
  stream,
  chunkDuration,
  onToggle,
  onPromptChange,
  onChunkDurationChange,
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

      {/* 🎛 チャンク長選択 */}
      <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
        <label htmlFor="chunkDuration">⏱️ チャンク長：</label>
        <select
          id="chunkDuration"
          value={chunkDuration}
          onChange={(e) => onChunkDurationChange(Number(e.target.value))}
          className="border px-2 py-1 rounded text-sm"
        >
          {[10, 20, 30, 60, 120, 300].map((sec) => (
            <option key={sec} value={sec}>
              {sec} 秒
            </option>
          ))}
        </select>
      </div>

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
