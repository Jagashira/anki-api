// app/recorder/page.tsx
"use client";

import React, {
  useEffect,
  useRef,
  useState,
  Dispatch,
  SetStateAction,
} from "react";
import ChunkLogList from "@/components/minutes/ChunkLogList";
import RecorderCard from "@/components/minutes/RecorderCard";
import SummaryCard from "@/components/minutes/SummaryCard";

type ChunkLog = {
  id: number;
  audioBlob?: Blob;
  status: "sending" | "success" | "error";
  text?: string;
  error?: string;
  timestamp?: Date;
};

type ApiPrompt = {
  id: string;
  label: string;
  text: string;
};

export default function RecorderPage() {
  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [logs, setLogs] = useState<ChunkLog[]>([]);
  const [summary, setSummary] = useState<string | null>(null);
  const [promptText, setPromptText] = useState("");
  const [chunkDuration, setChunkDuration] = useState(10); // UI上は秒単位
  const [isSaved, setIsSaved] = useState(false);
  const [loadingPrompts, setLoadingPrompts] = useState(true);
  const [currentMimeType, setCurrentMimeType] = useState<string>(""); // For display

  const chunkIdCounterRef = useRef(1);
  const elapsedTimeTimerRef = useRef<NodeJS.Timeout | null>(null); // For elapsed time display
  const chunkIntervalRef = useRef<NodeJS.Timeout | null>(null); // For triggering chunks
  const streamRef = useRef<MediaStream | null>(null);
  const accumulatedTextRef = useRef("");
  const isActuallyRecordingRef = useRef(false); // More precise recording state for interval
  const isStoppingRef = useRef(false); // To prevent race conditions on stop

  useEffect(() => {
    const fetchInitialPrompts = async () => {
      setLoadingPrompts(true);
      try {
        const res = await fetch("/api/test/prompts");
        if (!res.ok) throw new Error(`プロンプトの取得に失敗: ${res.status}`);
        const data: ApiPrompt[] = await res.json();
        if (data && data.length > 0) setPromptText(data[0].text);
        else setPromptText("会議内容を分かりやすく要約してください。");
      } catch (err) {
        console.error("プロンプト取得エラー:", err);
        setPromptText("会議内容を分かりやすく要約してください。");
      } finally {
        setLoadingPrompts(false);
      }
    };
    fetchInitialPrompts();

    return () => {
      // Cleanup on unmount
      if (elapsedTimeTimerRef.current)
        clearInterval(elapsedTimeTimerRef.current);
      if (chunkIntervalRef.current) clearInterval(chunkIntervalRef.current);
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  const addOrUpdateLog = (logEntry: Partial<ChunkLog> & { id: number }) => {
    setLogs((prevLogs) => {
      const existingLogIndex = prevLogs.findIndex((l) => l.id === logEntry.id);
      if (existingLogIndex > -1) {
        const updatedLogs = [...prevLogs];
        updatedLogs[existingLogIndex] = {
          ...updatedLogs[existingLogIndex],
          ...logEntry,
        };
        return updatedLogs;
      } else {
        return [...prevLogs, logEntry as ChunkLog];
      }
    });
  };

  const recordAndProcessCurrentChunk = async (): Promise<void> => {
    if (
      !isActuallyRecordingRef.current ||
      !streamRef.current ||
      !streamRef.current.active
    ) {
      console.warn(
        "録音中ではないか、ストリームが無効なため、チャンク処理をスキップします。"
      );
      return Promise.resolve(); // Not recording or stream invalid
    }

    const currentChunkId = chunkIdCounterRef.current++;
    // Immediately add a log entry with "sending" status
    addOrUpdateLog({
      id: currentChunkId,
      status: "sending",
      timestamp: new Date(),
    });
    console.log(`チャンク ${currentChunkId} の処理を開始`);

    return new Promise<void>((resolve, reject) => {
      if (!streamRef.current) {
        // Should not happen if isActuallyRecordingRef is true
        addOrUpdateLog({
          id: currentChunkId,
          status: "error",
          error: "MediaStreamが見つかりません",
        });
        reject(new Error("MediaStreamが見つかりません"));
        return;
      }

      let recorder: MediaRecorder;
      let chosenMimeType = "";
      try {
        const MimeTypesToTry = [
          "audio/webm;codecs=opus",
          "audio/mp4",
          "audio/webm",
        ];
        for (const type of MimeTypesToTry) {
          if (MediaRecorder.isTypeSupported(type)) {
            chosenMimeType = type;
            break;
          }
        }
        if (!chosenMimeType) {
          // Fallback to no specific MIME type if none of the preferred are supported
          console.warn(
            "主要なMIMEタイプが見つかりませんでした。ブラウザのデフォルト設定で試みます。"
          );
        }
        setCurrentMimeType(chosenMimeType || "ブラウザデフォルト"); // Update UI

        recorder = new MediaRecorder(
          streamRef.current,
          chosenMimeType ? { mimeType: chosenMimeType } : undefined
        );
      } catch (err) {
        console.error(
          `チャンク ${currentChunkId} の MediaRecorder 初期化失敗:`,
          err
        );
        addOrUpdateLog({
          id: currentChunkId,
          status: "error",
          error: `Recorder初期化エラー: ${
            err instanceof Error ? err.message : String(err)
          }`,
        });
        reject(err);
        return;
      }

      const recordedBlobs: Blob[] = [];

      recorder.ondataavailable = (event: BlobEvent) => {
        if (event.data.size > 0) {
          recordedBlobs.push(event.data);
        }
      };

      recorder.onstop = async () => {
        console.log(`チャンク ${currentChunkId} MediaRecorder.onstop`);
        if (recordedBlobs.length > 0) {
          const chunkBlob = new Blob(recordedBlobs, {
            type: recorder.mimeType || chosenMimeType,
          });
          addOrUpdateLog({ id: currentChunkId, audioBlob: chunkBlob }); // Store blob for potential UI playback

          const fileExtension =
            (recorder.mimeType || chosenMimeType)
              .split("/")[1]
              ?.split(";")[0] || "webm";
          const fileName = `chunk-${currentChunkId}-${Date.now()}.${fileExtension}`;
          const audioFile = new File([chunkBlob], fileName, {
            type: recorder.mimeType || chosenMimeType,
          });

          const formData = new FormData();
          formData.append("audio", audioFile); // Ensure backend expects "audio"

          try {
            const res = await fetch("/api/test/whisper", {
              method: "POST",
              body: formData,
            });
            if (!res.ok) {
              let errorMsg = `Whisper APIエラー: ${res.status}`;
              try {
                const errData = await res.json();
                errorMsg += ` - ${
                  errData.message || errData.error || "詳細不明"
                }`;
              } catch {}
              throw new Error(errorMsg);
            }
            const result = await res.json();
            const text = result.text || "";
            addOrUpdateLog({
              id: currentChunkId,
              status: "success",
              text: text,
            });
            accumulatedTextRef.current += text + "\n";
          } catch (err: any) {
            console.error(`チャンク ${currentChunkId} テキスト化失敗:`, err);
            addOrUpdateLog({
              id: currentChunkId,
              status: "error",
              error: err.message,
            });
          }
        } else {
          console.warn(`チャンク ${currentChunkId} で録音データなし`);
          addOrUpdateLog({
            id: currentChunkId,
            status: "error",
            error: "録音データなし",
          });
        }
        resolve(); // Resolve the promise for this chunk
      };

      recorder.onerror = (event) => {
        console.error(
          `チャンク ${currentChunkId} MediaRecorder エラー:`,
          event
        );
        // @ts-ignore
        const error = event.error as DOMException;
        addOrUpdateLog({
          id: currentChunkId,
          status: "error",
          error: `Recorderエラー: ${error?.name}`,
        });
        reject(error || new Error("MediaRecorder error"));
      };

      recorder.start();
      console.log(
        `チャンク ${currentChunkId} 録音開始 (MIME: ${
          recorder.mimeType || "default"
        }, Duration: ${chunkDuration}s)`
      );
      setTimeout(() => {
        if (recorder.state === "recording") {
          recorder.stop();
        }
      }, chunkDuration * 1000);
    });
  };

  const startFullRecording = async () => {
    if (recording || isStoppingRef.current) return;
    console.log("フル録音処理を開始します。");

    setIsSaved(false);
    setLogs([]);
    setSummary(null);
    accumulatedTextRef.current = "";
    chunkIdCounterRef.current = 1;
    setElapsed(0);
    isActuallyRecordingRef.current = true; // Set precise recording flag

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      setRecording(true); // Update UI state

      if (elapsedTimeTimerRef.current)
        clearInterval(elapsedTimeTimerRef.current);
      elapsedTimeTimerRef.current = setInterval(
        () => setElapsed((prev) => prev + 1),
        1000
      );

      await recordAndProcessCurrentChunk(); // Process first chunk immediately

      if (chunkIntervalRef.current) clearInterval(chunkIntervalRef.current);
      chunkIntervalRef.current = setInterval(async () => {
        if (!isActuallyRecordingRef.current) {
          // Check precise flag
          if (chunkIntervalRef.current) clearInterval(chunkIntervalRef.current);
          return;
        }
        await recordAndProcessCurrentChunk();
      }, chunkDuration * 1000);
    } catch (error) {
      console.error("録音開始エラー:", error);
      alert(
        `マイクのアクセスまたは録音の開始に失敗しました: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
      setRecording(false);
      isActuallyRecordingRef.current = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    }
  };

  const stopFullRecording = async () => {
    if (!isActuallyRecordingRef.current && !isStoppingRef.current) {
      console.log("録音中でないため停止処理をスキップ。");
      setRecording(false); // Ensure UI is consistent
      return;
    }
    if (isStoppingRef.current) {
      console.log("既に停止処理中です。");
      return;
    }

    console.log("フル録音停止処理を開始します。");
    isStoppingRef.current = true; // Indicate stopping process has started
    isActuallyRecordingRef.current = false; // Stop new chunks from being initiated by interval
    setRecording(false); // Update UI immediately

    if (chunkIntervalRef.current) clearInterval(chunkIntervalRef.current);
    if (elapsedTimeTimerRef.current) clearInterval(elapsedTimeTimerRef.current);

    try {
      // Process one final chunk if there was any ongoing recording activity
      // This needs careful handling to ensure it doesn't start a new full chunk if already stopped
      console.log("最後のチャンクを処理試行 (もしあれば)");
      // A more robust way might be to have a flag if a chunk was *just* started
      // For now, this relies on the setTimeout in recordAndProcessCurrentChunk to complete
      // If a chunk was *just* started by the interval before this stop, it will complete.
      // If not, this call might not do much or might error if stream is already closed.
      // The promise from the last chunk in the interval isn't directly awaited here.
      // Consider a small delay to allow the last interval's chunk to finish its stop()
      await new Promise((resolve) => setTimeout(resolve, 100)); // Small delay
    } catch (finalChunkError) {
      console.error("最終チャンク処理中のエラー(無視):", finalChunkError);
    }

    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    console.log("MediaStreamのトラックを停止しました。");

    const rawText = accumulatedTextRef.current.trim();
    if (rawText) {
      setSummary("要約中...");
      try {
        const summaryRes = await fetch("/api/test/summary", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: rawText, prompt: promptText }),
        });
        if (!summaryRes.ok) {
          let errorMsg = `要約APIエラー: ${summaryRes.status}`;
          try {
            const errData = await summaryRes.json();
            errorMsg += ` - ${errData.message || errData.error || "詳細不明"}`;
          } catch {}
          throw new Error(errorMsg);
        }
        const summaryData = await summaryRes.json();
        setSummary(summaryData.summary || "要約結果が空です。");
      } catch (err: any) {
        console.error("要約エラー:", err);
        setSummary(`要約中にエラー: ${err.message}`);
      }
    } else {
      setSummary(null);
    }
    isStoppingRef.current = false; // Reset stopping flag
  };

  const handleSave = async () => {
    /* (Implementation from previous version) */
    if (
      !summary ||
      summary.startsWith("要約中...") ||
      summary.startsWith("要約エラー:")
    ) {
      alert("保存できる有効な要約がありません。");
      return;
    }
    const successfulLogsText = logs
      .filter((log) => log.status === "success" && log.text)
      .map((log) => {
        const time = log.timestamp
          ? log.timestamp.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })
          : "時刻不明";
        return `[${time}] ${log.text}`;
      })
      .join("\n\n");

    if (!successfulLogsText && !summary) {
      alert("保存する内容がありません。");
      return;
    }
    const dataToSave = {
      summary: summary,
      fullTranscript: successfulLogsText,
      prompt: promptText,
      recordedAt: new Date().toISOString(),
      chunkDurationUsedSec: chunkDuration,
      mimeTypeUsed: currentMimeType,
    };
    console.log("保存データ:", dataToSave);
    try {
      const res = await fetch("/api/test/minutes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSave),
      });
      if (!res.ok) {
        let errorMsg = `保存APIエラー: ${res.status}`;
        try {
          const errData = await res.json();
          errorMsg += ` - ${errData.message || errData.error || "詳細不明"}`;
        } catch {}
        throw new Error(errorMsg);
      }
      const saveData = await res.json();
      alert(`保存しました。ドキュメントID: ${saveData.id}`);
      setIsSaved(true);
    } catch (err: any) {
      alert(`保存に失敗しました: ${err.message}`);
    }
  };
  const retrySummary = async () => {
    /* (Implementation from previous version) */
    const rawText = accumulatedTextRef.current.trim();
    if (!rawText) {
      alert("要約するテキストがありません。");
      return;
    }
    setSummary("要約再試行中...");
    setIsSaved(false);
    try {
      const summaryRes = await fetch("/api/test/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: rawText, prompt: promptText }),
      });
      if (!summaryRes.ok) {
        let errorMsg = `要約APIエラー: ${summaryRes.status}`;
        try {
          const errData = await summaryRes.json();
          errorMsg += ` - ${errData.message || errData.error || "詳細不明"}`;
        } catch {}
        throw new Error(errorMsg);
      }
      const summaryData = await summaryRes.json();
      setSummary(summaryData.summary || "要約結果が空です。");
    } catch (err: any) {
      setSummary(`要約再試行エラー: ${err.message}`);
    }
  };

  if (loadingPrompts) {
    return (
      <div className="p-6 text-center text-gray-500">
        プロンプト読み込み中...
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-6 bg-slate-100 min-h-screen">
      <header className="text-center py-6">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-800">
          AI議事録アシスタント
        </h1>
      </header>
      <main className="space-y-6">
        <RecorderCard
          recording={recording}
          elapsed={elapsed}
          prompt={promptText}
          stream={streamRef.current}
          chunkDuration={chunkDuration}
          onToggle={recording ? stopFullRecording : startFullRecording}
          onPromptChange={setPromptText as (value: string) => void}
          onChunkDurationChange={(durationInSeconds) =>
            setChunkDuration(durationInSeconds)
          }
          // disabled={loadingPrompts || isStoppingRef.current}
        />
        {summary && (
          <SummaryCard
            summary={summary}
            onRetry={retrySummary}
            onSave={handleSave}
            disabled={
              isSaved ||
              summary.startsWith("要約中...") ||
              summary.startsWith("要約エラー:") ||
              isStoppingRef.current
            }
          />
        )}
        <ChunkLogList logs={logs} />
      </main>
      <footer className="text-center text-xs text-gray-600 py-8 mt-10 border-t border-slate-300">
        <p>MIME Type: {currentMimeType || "N/A"}</p>
        <p>&copy; {new Date().getFullYear()} AI議事録アプリ (vPCLogiciOS)</p>
      </footer>
    </div>
  );
}
