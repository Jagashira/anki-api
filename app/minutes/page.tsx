"use client";

import ChunkLogList from "@/components/minutes/ChunkLogList";
import RecorderCard from "@/components/minutes/RecorderCard";
import SummaryCard from "@/components/minutes/SummaryCard";
import { saveMinutes } from "@/lib/minutes/save";
import { fetchSummary } from "@/lib/minutes/summary";
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
  const [chunkDuration, setChunkDuration] = useState(10); // 単位: 秒
  const [isSaved, setIsSaved] = useState(false);

  const chunkIdRef = useRef(1);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const textBufferRef = useRef("");
  const recordingRef = useRef(false);

  const handleSave = async () => {
    if (!summary || logs.length === 0) return;
    const id = await saveMinutes({ summary, logs, prompt });
    alert(`保存しました。ドキュメントID: ${id}`);
    setIsSaved(true); // ✅ 保存成功後にフラグON
  };

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
      setTimeout(() => recorder.stop(), chunkDuration * 1000);
    });
  };

  const startFullRecording = async () => {
    setIsSaved(false);
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
  const retrySummary = async () => {
    const rawText = textBufferRef.current.trim();
    if (!rawText) return;

    const result = await fetchSummary(rawText);
    setSummary(result);
    setIsSaved(false);
  };

  return (
    <>
      <div className="p-6 max-w-2xl mx-auto">
        <RecorderCard
          recording={recording}
          elapsed={elapsed}
          prompt={prompt}
          stream={streamRef.current}
          chunkDuration={chunkDuration}
          onToggle={recording ? stopFullRecording : startFullRecording}
          onPromptChange={setPrompt}
          onChunkDurationChange={setChunkDuration}
        />

        {summary && (
          <SummaryCard
            summary={summary}
            onRetry={retrySummary}
            onSave={handleSave}
            disabled={isSaved}
          />
        )}

        <ChunkLogList logs={logs} />
      </div>
    </>
  );
}
