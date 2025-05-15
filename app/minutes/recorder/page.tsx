"use client";

import React, { useEffect, useRef, useState } from "react";
import { calculateWhisperUsage, getAudioDuration } from "@/lib/usage";
import { prompts, PromptType } from "@/components/recordtest/PromptSelector";
import { saveTranscriptToFirestore } from "@lib/saveTranscript";
import { TranscriptList } from "@/components/recordtest/TranscriptList";
import RecordingPromptPanel from "@/components/recordtest/RecordingPromptPanel";
import { SummaryDisplay } from "@/components/recordtest/SummaryDisplay";
import GraphDisplay from "@/components/recordtest/GraphDisplay";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export default function SpeechPage() {
  const [recording, setRecording] = useState(false);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [summary, setSummary] = useState<string>("");
  const [transcript, setTranscript] = useState<string>("");
  const [audioDuration, setAudioDuration] = useState<number | null>(null);
  const [gptUsage, setGptUsage] = useState<number | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [fileSize, setFileSize] = useState<number | null>(null);
  const [canSendWhisper, setCanSendWhisper] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isSendingToWhisper, setIsSendingToWhisper] = useState(false);
  const [isSendingToChatGPT, setIsSendingToChatGPT] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);

  const [promptType, setPromptType] = useState<PromptType>("simple");
  const [isCuntomPrompt, setIsCustomPrompt] = useState(false);
  const [customPrompt, setCustomPrompt] = useState("");
  const [isMarkdown, setIsMarkdown] = useState(false);
  const [graphType, setGraphType] = useState<
    "tokens" | "apiUsage" | "responseTime"
  >("tokens");

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    setStream(stream);
    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;
    const chunks: Blob[] = [];

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };

    mediaRecorder.onstop = async () => {
      setAudioChunks(chunks);
      const audioBlob = new Blob(chunks, { type: "audio/webm" });
      setAudioBlob(audioBlob);

      const duration = await getAudioDuration(audioBlob);
      setAudioDuration(duration);

      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);

      const size = audioBlob.size;
      setFileSize(size);
      setCanSendWhisper(true);
    };

    mediaRecorder.start();
    setRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
    setStream(null);
  };

  const handleSendToWhisper = async () => {
    if (!audioBlob || !audioDuration || isSendingToWhisper) return;
    setIsSendingToWhisper(true);

    const formData = new FormData();
    formData.append("audio", audioBlob, "audio.webm");
    formData.append("duration", audioDuration.toString());

    try {
      const res = await fetch("/api/whisper", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok && data.text) {
        setTranscript(data.text);
      } else {
        throw new Error(data.error || "Whisper変換に失敗しました");
      }
    } catch (error) {
      console.error("Whisper送信失敗:", error);
      const url = URL.createObjectURL(audioBlob);
      setDownloadUrl(url);
    } finally {
      setIsSendingToWhisper(false);
    }
  };

  const handleSendToChatGPT = async () => {
    if (!transcript || isSendingToChatGPT) return;
    setIsSendingToChatGPT(true);

    const summaryRes = await fetch("/api/chatgpt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: transcript,
        prompt: isCuntomPrompt ? customPrompt : prompts[promptType],
      }),
    });

    const summaryData = await summaryRes.json();
    setGptUsage(summaryData.tokens);
    setSummary(summaryData.summary || "要約を取得できませんでした。");

    await saveTranscriptToFirestore({
      duration: audioDuration!,
      promptType,
      customPrompt: isCuntomPrompt ? customPrompt : undefined,
      whisperText: transcript,
      chatGptSummary: summaryData.summary || "",
    });
    setIsSendingToChatGPT(false);
  };
  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;

    if (recording) {
      setRecordingTime(0);
      interval = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [recording]);

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <RecordingPromptPanel
        promptType={promptType}
        setPromptType={setPromptType}
        customPrompt={customPrompt}
        setCustomPrompt={setCustomPrompt}
        setIsCustomPrompt={setIsCustomPrompt}
        startRecording={startRecording}
        stopRecording={stopRecording}
        recording={recording}
        audioStream={stream}
        recordingTime={recordingTime}
      />

      {/* Whisper送信前の確認パネル */}
      {canSendWhisper && audioBlob && audioDuration && (
        <div className="space-y-2 p-4 border rounded bg-gray-50">
          <p>📦 ファイルサイズ: {(fileSize! / 1024 / 1024).toFixed(2)} MB</p>
          <p>
            💰 推定使用量: 約 {((audioDuration / 60) * 1000).toFixed(0)}{" "}
            トークン ({calculateWhisperUsage(audioDuration).jpy} 円)
          </p>

          {fileSize! > 26_214_400 ? (
            <p className="text-red-600 font-bold">
              ⚠️
              ファイルサイズがWhisperの上限（25MB）を超えています。分割が必要です。
            </p>
          ) : (
            <>
              <Button
                onClick={handleSendToWhisper}
                disabled={isSendingToWhisper}
              >
                {isSendingToWhisper ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="animate-spin w-4 h-4" />
                    送信中...
                  </div>
                ) : (
                  "📤 Whisper に送信する"
                )}
              </Button>
              <p className="text-sm text-gray-500">
                （送信失敗したら何度でも押せます）
              </p>
              {audioUrl && (
                <div className="space-y-1">
                  {/* <p className="text-gray-700 font-medium">🔊 録音プレビュー</p> */}
                  <audio src={audioUrl} controls className="w-full" />
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Whisper送信失敗時のダウンロードリンク */}
      {downloadUrl && (
        <div className="space-y-2 p-4 border rounded bg-red-50">
          <p className="text-red-800">⚠️ Whisper送信に失敗しました。</p>
          <a
            href={downloadUrl}
            download="recording_failed.webm"
            className="text-blue-700 underline"
          >
            ⬇️ 音声ファイルをダウンロードする
          </a>
        </div>
      )}

      {/* ChatGPT送信ボタン */}
      {transcript && (
        <div className="space-y-2 p-4 border rounded bg-blue-50">
          <p className="text-blue-800">Whisperの文字起こしが完了しました。</p>
          <Button onClick={handleSendToChatGPT} disabled={isSendingToChatGPT}>
            {isSendingToChatGPT ? (
              <div className="flex items-center gap-2">
                <Loader2 className="animate-spin w-4 h-4" />
                送信中...
              </div>
            ) : (
              "💬 ChatGPT に送信する"
            )}
          </Button>
        </div>
      )}

      <SummaryDisplay
        summary={summary}
        transcript={transcript}
        isMarkdown={promptType === "markdown"}
      />
      <TranscriptList />
      <GraphDisplay />
    </div>
  );
}
