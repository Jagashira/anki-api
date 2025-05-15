"use client";

import ChunkLogList from "@/components/minutes/ChunkLogList";
import RecorderCard from "@/components/minutes/RecorderCard";
import { useRef, useState } from "react";

type ChunkLog = {
  id: number;
  status: "sending" | "success" | "error";
  text?: string;
  error?: string;
};
const PROMPT_OPTIONS = [
  "議事録風に要約",
  "要点を箇条書きで",
  "口語→丁寧文に変換",
];

export default function RecorderPage() {
  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [logs, setLogs] = useState<ChunkLog[]>([]);
  const [summary, setSummary] = useState<string | null>(null);
  const [prompt, setPrompt] = useState(PROMPT_OPTIONS[0]);

  const chunkIdRef = useRef(1);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const textBufferRef = useRef("");
  const recordingRef = useRef(false);

  const formatTime = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(
      2,
      "0"
    )}`;

  const recordChunk = async (): Promise<void> => {
    if (!recordingRef.current && !streamRef.current) return;

    const id = chunkIdRef.current++;
    addLog({ id, status: "sending" });

    const stream = streamRef.current;
    if (!stream) return;

    return new Promise((resolve) => {
      const recorder = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus",
      });

      recorder.ondataavailable = async (e: BlobEvent) => {
        const blob = e.data;
        const audio = new Audio(URL.createObjectURL(blob));

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

        resolve();
      };

      recorder.start();
      setTimeout(() => recorder.stop(), 10_000);
    });
  };

  const startFullRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    streamRef.current = stream;
    recordingRef.current = true;
    setRecording(true);
    setSummary(null);
    setLogs([]);
    textBufferRef.current = "";
    chunkIdRef.current = 1;
    setElapsed(0);

    // 経過時間タイマー
    timerRef.current = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);

    await recordChunk();
    intervalRef.current = setInterval(() => {
      recordChunk();
    }, 10_000);
  };

  const stopFullRecording = async () => {
    recordingRef.current = false;
    setRecording(false);

    if (intervalRef.current) clearInterval(intervalRef.current);
    if (timerRef.current) clearInterval(timerRef.current);

    await recordChunk();

    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;

    const rawText = textBufferRef.current.trim();
    if (!rawText) return;

    try {
      const res = await fetch("/api/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: rawText }),
      });

      const json = await res.json();
      setSummary(json.summary || "要約に失敗しました");
    } catch (err) {
      setSummary("要約中にエラーが発生しました");
    }
  };

  const addLog = (log: ChunkLog) => setLogs((prev) => [...prev, log]);
  const updateLog = (id: number, updates: Partial<ChunkLog>) => {
    setLogs((prev) =>
      prev.map((log) => (log.id === id ? { ...log, ...updates } : log))
    );
  };

  return (
    <>
      <div className="p-6 max-w-2xl mx-auto">
        <RecorderCard />
        <ChunkLogList logs={logs} />
        {/* 🎙️ したは保存のため残している*/}
        -------------------------------------------------------------
        <h1 className="text-2xl font-bold mb-4">🎙️ 議事録録音アプリ</h1>
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={recording ? stopFullRecording : startFullRecording}
            className={`px-6 py-2 rounded text-white font-semibold transition ${
              recording
                ? "bg-red-600 hover:bg-red-700"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {recording ? "⏹️ 録音停止と要約" : "⏺️ 録音開始"}
          </button>

          {recording && (
            <span className="text-gray-700 font-mono text-lg">
              ⏱️ {formatTime(elapsed)}
            </span>
          )}
        </div>
        <section className="mt-4">
          <h2 className="text-lg font-semibold mb-2">📦 チャンクログ</h2>
          <ul className="space-y-3">
            {logs.map((log) => (
              <li
                key={log.id}
                className={`p-3 border rounded shadow-sm ${
                  log.status === "success"
                    ? "bg-green-50 border-green-300"
                    : log.status === "error"
                    ? "bg-red-50 border-red-300"
                    : "bg-yellow-50 border-yellow-300"
                }`}
              >
                <div className="font-semibold">Chunk {log.id}</div>
                {log.status === "sending" && <div>⏳ 送信中...</div>}
                {log.status === "success" && <div>✅ 成功</div>}
                {log.status === "error" && <div>❌ エラー: {log.error}</div>}
                {log.text && (
                  <div className="mt-2 text-sm whitespace-pre-wrap text-gray-700">
                    {log.text}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </section>
        {summary && (
          <section className="mt-8 p-4 border rounded bg-white shadow">
            <h2 className="text-lg font-bold mb-2">📋 GPTによる議事録要約</h2>
            <div className="whitespace-pre-wrap text-gray-800">{summary}</div>
          </section>
        )}
      </div>
      <div className="p-6 max-w-3xl mx-auto space-y-6">
        {/* 🎙️ 録音セクション */}
        <section className="p-4 border rounded bg-gray-50 space-y-4 shadow">
          <div className="text-center">
            <button
              onClick={recording ? stopFullRecording : startFullRecording}
              className={`px-6 py-2 rounded text-white font-semibold ${
                recording ? "bg-red-600" : "bg-blue-600"
              }`}
            >
              {recording ? "録音停止" : "録音開始"}
            </button>
          </div>

          <div className="flex justify-center items-center gap-4">
            <label className="text-sm font-medium">🧠 プロンプト:</label>
            <select
              className="border rounded px-2 py-1 text-sm"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            >
              {PROMPT_OPTIONS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          <div className="text-center text-sm font-mono text-gray-700">
            ⏱️ 経過時間: {formatTime(elapsed)}
          </div>

          <div className="h-16 bg-gradient-to-r from-indigo-300 to-indigo-500 rounded animate-pulse opacity-30 text-center flex items-center justify-center text-white text-sm">
            🎵 波形ビジュアライザー（仮）
          </div>
        </section>

        {/* 📝 文字起こし表示・編集セクション */}
        <section className="p-4 border rounded bg-white shadow space-y-4">
          <h2 className="text-lg font-bold">📝 チャンク文字起こし</h2>
          <ul className="space-y-3">
            {logs.map((log) => (
              <li key={log.id} className="p-3 border rounded bg-gray-50">
                <div className="flex justify-between items-center font-semibold">
                  <span>Chunk {log.id}</span>
                  {log.status === "sending" && "送信中..."}
                  {log.status === "success" && "✅ 成功"}
                  {log.status === "error" && "❌ エラー"}
                </div>
                {log.text && (
                  <textarea
                    defaultValue={log.text}
                    className="w-full mt-2 p-2 text-sm border rounded resize-y"
                  />
                )}
                <div className="flex gap-2 mt-2">
                  <button className="text-xs px-2 py-1 bg-gray-200 rounded">
                    ✏️ 編集
                  </button>
                  <button className="text-xs px-2 py-1 bg-blue-200 rounded">
                    🔁 再取得
                  </button>
                </div>
              </li>
            ))}
          </ul>

          {summary && (
            <div className="mt-6 p-4 border rounded bg-green-50">
              <h3 className="font-bold mb-2">📋 要約</h3>
              <pre className="whitespace-pre-wrap text-sm text-gray-800">
                {summary}
              </pre>
              <button className="mt-2 px-3 py-1 text-sm bg-blue-500 text-white rounded">
                💾 保存
              </button>
            </div>
          )}
        </section>
      </div>
    </>
  );
}
