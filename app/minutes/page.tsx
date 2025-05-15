"use client";

import { useEffect, useRef, useState } from "react";
import ChunkLogList from "@/components/minutes/ChunkLogList";
import RecorderCard from "@/components/minutes/RecorderCard";
import SummaryCard from "@/components/minutes/SummaryCard";
import { fetchSummary } from "@/lib/minutes/summary";
import { saveMinutes } from "@/lib/minutes/save";
import RecordRTC from "recordrtc";

type ChunkLog = {
  id: number;
  status: "sending" | "success" | "error";
  text?: string;
  error?: string;
};

export default function RecorderPage() {
  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [logs, setLogs] = useState<ChunkLog[]>([]);
  const [summary, setSummary] = useState<string | null>(null);
  const [promptText, setPromptText] = useState("");
  const [chunkDuration, setChunkDuration] = useState(10);
  const [isSaved, setIsSaved] = useState(false);
  const [loadingPrompts, setLoadingPrompts] = useState(true);

  const chunkIdRef = useRef(1);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const textBufferRef = useRef("");
  const recordingRef = useRef(false);
  const rtcRef = useRef<RecordRTC | null>(null);
  const isFallbackRef = useRef(false);

  useEffect(() => {
    const fetchPrompts = async () => {
      try {
        const res = await fetch("/api/prompts");
        const data = await res.json();
        if (data.length > 0) setPromptText(data[0].text);
      } catch {
        setPromptText("会議内容を分かりやすく要約してください。");
      } finally {
        setLoadingPrompts(false);
      }
    };
    fetchPrompts();
  }, []);

  const handleSave = async () => {
    if (!summary || logs.length === 0) return;
    const id = await saveMinutes({ summary, logs, prompt: promptText });
    alert(`保存しました。ドキュメントID: ${id}`);
    setIsSaved(true);
  };

  const recordChunk = async (): Promise<void> => {
    if (!recordingRef.current || !streamRef.current) return;

    const id = chunkIdRef.current++;
    addLog({ id, status: "sending" });

    const stream = streamRef.current;

    return new Promise((resolve) => {
      const onChunkReady = async (blob: Blob) => {
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

      if (isFallbackRef.current) {
        const recorder = new RecordRTC(stream, {
          type: "audio",
          mimeType: "audio/webm",
        });
        recorder.startRecording();
        rtcRef.current = recorder;

        setTimeout(async () => {
          recorder.stopRecording(() => {
            const blob = recorder.getBlob();
            onChunkReady(blob);
          });
        }, chunkDuration * 1000);
      } else {
        const recorder = new MediaRecorder(stream, {
          mimeType: "audio/webm;codecs=opus",
        });

        recorder.ondataavailable = (e: BlobEvent) => {
          onChunkReady(e.data);
        };

        recorder.start();
        setTimeout(() => recorder.stop(), chunkDuration * 1000);
      }
    });
  };

  const startFullRecording = async () => {
    setIsSaved(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      recordingRef.current = true;
      setRecording(true);
      setSummary(null);
      setLogs([]);
      textBufferRef.current = "";
      chunkIdRef.current = 1;
      setElapsed(0);

      // fallback 判定
      isFallbackRef.current = !window.MediaRecorder;

      timerRef.current = setInterval(() => {
        setElapsed((prev) => prev + 1);
      }, 1000);

      await recordChunk();
      intervalRef.current = setInterval(() => {
        recordChunk();
      }, chunkDuration * 1000);
    } catch (error) {
      alert(
        "録音を開始できませんでした。マイクが許可されているか確認してください。"
      );
    }
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

  if (loadingPrompts) {
    return (
      <div className="p-6 text-center text-gray-500">
        プロンプト読み込み中...
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <RecorderCard
        recording={recording}
        elapsed={elapsed}
        prompt={promptText}
        stream={streamRef.current}
        chunkDuration={chunkDuration}
        onToggle={recording ? stopFullRecording : startFullRecording}
        onPromptChange={setPromptText}
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
  );
}
