"use client";

import { useEffect, useRef, useState } from "react";
import WaveformVisualizer from "./WaveformVisualizer";
import PromptSelector from "./PromptSelector";
import { BsMicFill, BsStopFill } from "react-icons/bs";
import { PromptPreview } from "./PromptPreview";

export default function RecorderCard() {
  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [prompt, setPrompt] = useState<string>("default"); // ✅ 追加

  const [isFading, setIsFading] = useState(false);
  const [showText, setShowText] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const toggleRecording = async () => {
    if (recording) {
      stopRecording();
    } else {
      await startRecording();
    }
  };

  const startRecording = async () => {
    const mediaStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
    });
    setStream(mediaStream);
    setRecording(true);
    setElapsed(0);
    setShowText(false);

    timerRef.current = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);
  };

  const stopRecording = () => {
    setRecording(false);
    setIsFading(true);

    if (timerRef.current) clearInterval(timerRef.current);
    stream?.getTracks().forEach((track) => track.stop());

    setTimeout(() => {
      setIsFading(false);
      setShowText(true);
      setStream(null);
    }, 1000);
  };

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
          onClick={toggleRecording}
          className={`w-24 h-24 rounded-full flex items-center justify-center shadow-lg transition duration-300
            ${
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

      <PromptSelector prompt={prompt} onChange={setPrompt} />
      <PromptPreview prompt={prompt} />

      {/* ⏱ 時間 */}
      <div className="text-center text-gray-500 font-mono text-lg">
        ⏱ {formatTime(elapsed)}
      </div>

      {/* 📈 波形 or 停止メッセージ */}
      <div className="transition-all duration-500">
        {recording || isFading ? (
          <div
            className={`transition-opacity duration-700 ${
              isFading ? "opacity-0" : "opacity-100"
            }`}
          >
            <WaveformVisualizer stream={stream} active={recording} />
          </div>
        ) : showText ? (
          <div className="w-full h-16 flex items-center justify-center text-sm text-gray-500 bg-gray-100 rounded border">
            ⏹️ 録音は停止中です
          </div>
        ) : null}
      </div>
    </div>
  );
}
