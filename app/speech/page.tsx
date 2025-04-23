"use client";
import React, { useState, useRef } from "react";

export default function SpeechPage() {
  const [recording, setRecording] = useState(false);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [summary, setSummary] = useState<string>("");
  const [transcript, setTranscript] = useState<string>(""); // ← 追加
  const [isTranscriptOpen, setIsTranscriptOpen] = useState<boolean>(false); // ← 折りたたみ制御
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

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

      const formData = new FormData();
      formData.append("audio", audioBlob, "audio.webm");

      const res = await fetch("/api/whisper", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (data.text) {
        setTranscript(data.text); // ← Whisper結果を保存
        const summaryRes = await fetch("/api/chatgpt", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: data.text }),
        });

        const summaryData = await summaryRes.json();
        setSummary(summaryData.summary || "要約を取得できませんでした。");
      }
    };

    mediaRecorder.start();
    setRecording(true);
  };

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
        <div className="mt-6">
          <h2 className="text-lg font-bold mb-2">要約結果</h2>
          <p className="bg-gray-100 p-3 rounded">{summary}</p>
        </div>
      )}

      {/* 文字起こし（transcribe）の表示：折りたたみ式 */}
      {transcript && (
        <div className="mt-6">
          <button
            className="text-blue-600 underline"
            onClick={() => setIsTranscriptOpen(!isTranscriptOpen)}
          >
            {isTranscriptOpen
              ? "▲ 文字起こしを折りたたむ"
              : "▼ 文字起こしを見る"}
          </button>
          {isTranscriptOpen && (
            <div className="mt-2 bg-gray-50 p-3 rounded whitespace-pre-wrap text-sm max-h-96 overflow-y-auto">
              {transcript}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
