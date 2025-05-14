"use client";

import { useRef, useState } from "react";

type ChunkLog = {
  id: number;
  status: "sending" | "success" | "error";
  text?: string;
  error?: string;
};

export default function Recorder() {
  const [recording, setRecording] = useState(false);
  const [logs, setLogs] = useState<ChunkLog[]>([]);
  const [summary, setSummary] = useState<string | null>(null);
  const chunkIdRef = useRef(1);
  const textBufferRef = useRef("");
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const recordChunk = async () => {
    const id = chunkIdRef.current++;
    addLog({ id, status: "sending" });

    const stream = streamRef.current;
    if (!stream) return;

    const recorder = new MediaRecorder(stream, {
      mimeType: "audio/webm;codecs=opus",
    });

    recorder.ondataavailable = async (e: BlobEvent) => {
      const blob = e.data;

      const audio = new Audio(URL.createObjectURL(blob));
      audio.play();

      const file = new File([blob], `chunk-${id}.webm`, {
        type: "audio/webm;codecs=opus",
      });

      const formData = new FormData();
      formData.append("file", file);

      try {
        const res = await fetch("/api/whisper", {
          method: "POST",
          body: formData,
        });

        const text = await res.text();
        updateLog(id, { status: "success", text });
        textBufferRef.current += text + "\n";
      } catch (err: any) {
        updateLog(id, { status: "error", error: err.message });
      }
    };

    recorder.start();
    setTimeout(() => {
      recorder.stop();
    }, 10_000);
  };

  const addLog = (log: ChunkLog) => {
    setLogs((prev) => [...prev, log]);
  };

  const updateLog = (id: number, updates: Partial<ChunkLog>) => {
    setLogs((prev) =>
      prev.map((log) => (log.id === id ? { ...log, ...updates } : log))
    );
  };

  const startFullRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    streamRef.current = stream;
    setRecording(true);
    setSummary(null);
    textBufferRef.current = "";
    setLogs([]);
    chunkIdRef.current = 1;

    await recordChunk();
    intervalRef.current = setInterval(() => {
      recordChunk();
    }, 10_000);
  };

  const stopFullRecording = async () => {
    setRecording(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;

    const rawText = textBufferRef.current;
    if (!rawText.trim()) return;

    try {
      const res = await fetch("/api/summary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: rawText }),
      });

      const json = await res.json();
      setSummary(json.summary || "要約に失敗しました");
    } catch (err) {
      setSummary("要約エラー");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-xl font-bold">🎙️ 録音 & Whisperログ & GPT要約</h1>

      <button
        onClick={recording ? stopFullRecording : startFullRecording}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        {recording ? "録音停止と要約生成" : "録音開始"}
      </button>

      <div>
        <h2 className="font-semibold mt-4">🧾 チャンクログ</h2>
        <ul className="mt-2 space-y-2">
          {logs.map((log) => (
            <li key={log.id} className="p-2 border rounded bg-white">
              <div>
                <strong>Chunk {log.id}:</strong>{" "}
                {log.status === "sending" && "送信中..."}
                {log.status === "success" && "✅ 成功"}
                {log.status === "error" && "❌ エラー"}
              </div>
              {log.text && (
                <div className="text-sm mt-1 whitespace-pre-wrap text-gray-700">
                  {log.text}
                </div>
              )}
              {log.error && (
                <div className="text-sm text-red-500 mt-1">{log.error}</div>
              )}
            </li>
          ))}
        </ul>
      </div>

      {summary && (
        <div className="mt-6 p-4 border bg-green-50 rounded">
          <h2 className="font-bold mb-2">📋 GPTによる要約</h2>
          <div className="whitespace-pre-wrap">{summary}</div>
        </div>
      )}
    </div>
  );
}
