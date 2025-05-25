// app/page.tsx
"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import ChunkLogList, { TranscribedChunk } from "./_components/ChunkLogList"; // インポートパスを確認
import RecorderCard from "./_components/RecorderCard"; // インポートパスを確認
import SummaryCard from "./_components/SummaryCard"; // インポートパスを確認

const MainPage: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [transcribedTextChunks, setTranscribedTextChunks] = useState<
    TranscribedChunk[]
  >([]);
  const [fullTranscribedText, setFullTranscribedText] = useState("");
  const [summary, setSummary] = useState("");
  const [prompt, setPrompt] = useState("");
  const [chunkDuration, setChunkDuration] = useState(10); // デフォルト10秒

  const [isLoadingPrompt, setIsLoadingPrompt] = useState(true);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]); // MediaRecorderからの生チャンク
  const streamRef = useRef<MediaStream | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // 初期プロンプトの読み込み
  useEffect(() => {
    const fetchPrompt = async () => {
      setIsLoadingPrompt(true);
      try {
        // APIエンドポイントのパスを確認してください
        const response = await fetch("/api/test/prompts");
        if (!response.ok)
          throw new Error("プロンプトの読み込みに失敗しました。");
        const data = await response.json();
        setPrompt(data.prompt || "この会議の要点をまとめてください。");
      } catch (error) {
        console.error(error);
        setPrompt("この会議の要点をまとめてください。"); // フォールバック
        // alert((error as Error).message); // エラー表示はユーザー体験に応じて調整
      } finally {
        setIsLoadingPrompt(false);
      }
    };
    fetchPrompt();
  }, []);

  // タイマー処理
  useEffect(() => {
    if (isRecording) {
      timerIntervalRef.current = setInterval(() => {
        setElapsedTime((prevTime) => prevTime + 1);
      }, 1000);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [isRecording]);

  // クリーンアップ処理
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state !== "inactive"
      ) {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const handleStartRecording = useCallback(async () => {
    if (isRecording) return;
    setTranscribedTextChunks([]);
    setFullTranscribedText("");
    setSummary("");
    setElapsedTime(0);
    audioChunksRef.current = [];

    try {
      if (
        typeof navigator === "undefined" ||
        !navigator.mediaDevices ||
        typeof navigator.mediaDevices.getUserMedia !== "function"
      ) {
        console.error("navigator.mediaDevices.getUserMedia が利用できません。");
        alert(
          "お使いのブラウザ環境ではマイクを利用できません。HTTPS接続であるか、ブラウザのマイクアクセス許可設定などを確認してください。"
        );
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const options = { mimeType: "audio/webm" };
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        console.warn(
          `${options.mimeType} is not supported. Trying default or other options.`
        );
        // 必要であればここで別のmimeTypeを試すか、ユーザーに通知
      }

      mediaRecorderRef.current = new MediaRecorder(stream, options);

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
          const audioBlob = new Blob(audioChunksRef.current, {
            type: options.mimeType,
          });
          audioChunksRef.current = [];
          handleSendChunkToWhisper(audioBlob);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        setIsRecording(false);
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }
        const completeText = transcribedTextChunks
          .filter((chunk) => chunk.status === "success" && chunk.text)
          .map((chunk) => chunk.text)
          .join("\n");
        setFullTranscribedText(completeText);
        if (completeText.trim().length > 0) {
          handleGetSummary(completeText, prompt);
        }
      };
      mediaRecorderRef.current.start(chunkDuration * 1000);
      setIsRecording(true);
    } catch (error) {
      console.error("録音開始エラー:", error);
      let message =
        "マイクへのアクセスが許可されなかったか、録音を開始できませんでした。設定を確認してください。";
      if (error instanceof DOMException && error.name === "NotAllowedError") {
        message =
          "マイクへのアクセスがブロックされました。ブラウザのサイト設定でマイクの使用を許可してください。";
      } else if (
        error instanceof DOMException &&
        error.name === "NotFoundError"
      ) {
        message =
          "利用可能なマイクが見つかりませんでした。マイクが接続されているか確認してください。";
      }
      alert(message);
    }
  }, [isRecording, chunkDuration, prompt, transcribedTextChunks]);

  const handleStopRecording = useCallback(() => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "recording"
    ) {
      mediaRecorderRef.current.stop();
    }
  }, []);

  const handleSendChunkToWhisper = async (audioBlob: Blob) => {
    const chunkId = crypto.randomUUID();
    const newChunkEntry: TranscribedChunk = {
      id: chunkId,
      text: null,
      status: "sending",
      timestamp: Date.now(),
    };
    setTranscribedTextChunks((prev) => [...prev, newChunkEntry]);

    const formData = new FormData();
    formData.append("file", audioBlob, `audio_chunk_${chunkId}.webm`);

    try {
      // APIエンドポイントのパスを確認してください
      const response = await fetch("/api/test/whisper", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({
            detail: "Whisper APIエラー: 詳細不明 (レスポンス解析失敗)",
          }));
        throw new Error(
          errorData.detail ||
            `Whisper APIエラー (${response.status}): ${response.statusText}`
        );
      }
      const data = await response.json();
      setTranscribedTextChunks((prev) =>
        prev.map((c) =>
          c.id === chunkId ? { ...c, text: data.text, status: "success" } : c
        )
      );
    } catch (error) {
      console.error("Whisper APIエラー:", error);
      setTranscribedTextChunks((prev) =>
        prev.map((c) =>
          c.id === chunkId
            ? {
                ...c,
                text: `エラー: ${(error as Error).message}`,
                status: "error",
              }
            : c
        )
      );
    }
  };

  const handleGetSummary = async (
    textToSummarize: string,
    currentPrompt: string
  ) => {
    if (!textToSummarize.trim()) {
      // alert("要約するテキストがありません。"); // 必要に応じて通知
      return;
    }
    setIsLoadingSummary(true);
    setSummary("");
    try {
      // APIエンドポイントのパスを確認してください
      const response = await fetch("/api/test/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: textToSummarize, prompt: currentPrompt }),
      });
      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({
            detail: "要約APIエラー: 詳細不明 (レスポンス解析失敗)",
          }));
        throw new Error(
          errorData.detail ||
            `要約APIエラー (${response.status}): ${response.statusText}`
        );
      }
      const data = await response.json();
      setSummary(data.summary);
    } catch (error) {
      console.error("要約APIエラー:", error);
      // alert(`要約の取得に失敗しました: ${(error as Error).message}`); // 必要に応じて通知
      setSummary(`要約エラー: ${(error as Error).message}`);
    } finally {
      setIsLoadingSummary(false);
    }
  };

  const handleRetrySummary = () => {
    if (fullTranscribedText) {
      handleGetSummary(fullTranscribedText, prompt);
    } else {
      alert("再試行するテキストがありません。再度録音してください。");
    }
  };

  const handleSaveMeeting = async () => {
    if (!summary || !fullTranscribedText) {
      alert("保存する内容がありません。");
      return;
    }
    setIsSaving(true);
    try {
      // APIエンドポイントのパスを確認してください (/api/save は /api/test/save かなど)
      const response = await fetch("/api/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          summary: summary,
          log: fullTranscribedText,
          prompt: prompt,
          transcribedChunks: transcribedTextChunks // ChunkLogList で表示している全チャンクを送信
            .map((c) => `[${c.status}] ${c.text || "(テキストなし)"}`) // ステータスも付与
            .join("\n---\n"),
        }),
      });
      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({
            detail: "保存APIエラー: 詳細不明 (レスポンス解析失敗)",
          }));
        throw new Error(
          errorData.detail ||
            `保存APIエラー (${response.status}): ${response.statusText}`
        );
      }
      const data = await response.json();
      alert(data.message || "議事録を保存しました。");
    } catch (error) {
      console.error("保存エラー:", error);
      alert(`保存に失敗しました: ${(error as Error).message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const isProcessing = isLoadingPrompt || isLoadingSummary || isSaving;

  return (
    <div
      style={{
        maxWidth: "800px",
        margin: "20px auto",
        padding: "20px",
        fontFamily: "sans-serif",
      }}
    >
      <h1 style={{ textAlign: "center", marginBottom: "30px" }}>
        AI議事録アプリ
      </h1>

      <RecorderCard
        isRecording={isRecording}
        elapsedTime={elapsedTime}
        prompt={prompt}
        chunkDuration={chunkDuration}
        onStartRecording={handleStartRecording}
        onStopRecording={handleStopRecording}
        onPromptChange={setPrompt}
        onChunkDurationChange={setChunkDuration}
        isProcessing={isProcessing || isLoadingPrompt}
      />

      <h2
        style={{
          marginTop: "30px",
          borderBottom: "1px solid #eee",
          paddingBottom: "10px",
        }}
      >
        リアルタイムテキストログ
      </h2>
      {/* ChunkLogList の props 名が 'chunks' で正しいか、
          ChunkLogList.tsx の定義と合わせて確認してください。
          以前 'logs' に変更する提案をしました。 */}
      <ChunkLogList chunks={transcribedTextChunks} />

      <div style={{ marginTop: "30px" }}>
        <SummaryCard
          summary={summary}
          isLoadingSummary={isLoadingSummary}
          isSaving={isSaving}
          onRetrySummary={handleRetrySummary}
          onSaveMeeting={handleSaveMeeting}
          canSave={
            !!summary && !!fullTranscribedText && !isSaving && !isLoadingSummary
          }
        />
      </div>
    </div>
  );
};

export default MainPage;
