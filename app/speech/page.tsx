"use client";
import React, { useState, useRef } from "react";

export default function SpeechPage() {
  const [recording, setRecording] = useState(false);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [summary, setSummary] = useState<string>(""); // 要約結果を保存するstate
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  // 録音開始
  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;
    const chunks: Blob[] = [];

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };

    mediaRecorder.onstop = async () => {
      setAudioChunks(chunks);
      const audioBlob = new Blob(chunks, { type: "audio/webm" });

      // Whisper API に送信
      const formData = new FormData();
      formData.append("audio", audioBlob, "audio.webm");

      const res = await fetch("/api/whisper", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      // Whisper結果を受け取ったら、ChatGPT API に送信して要約を生成
      if (data.text) {
        const summaryRes = await fetch("/api/chatgpt", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text: data.text }),
        });

        const summaryData = await summaryRes.json();
        setSummary(summaryData.summary || "要約を取得できませんでした。");
      }
    };

    mediaRecorder.start();
    setRecording(true);
  };

  // 録音停止
  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  };

  return (
    <div className="p-4">
      <h1 className="text-xl mb-4">リアルタイム録音</h1>
      <button
        className="px-4 py-2 bg-blue-500 text-white rounded"
        onClick={recording ? stopRecording : startRecording}
      >
        {recording ? "録音停止" : "録音開始"}
      </button>

      {/* 要約結果の表示 */}
      {summary && (
        <div className="mt-4">
          <h2 className="text-lg">要約結果</h2>
          <p>{summary}</p>
        </div>
      )}
    </div>
  );
}
