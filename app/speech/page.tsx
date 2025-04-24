"use client";

import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { calculateUsage, getAudioDuration } from "@/app/lib/usage";
import {
  prompts,
  PromptSelector,
  PromptType,
} from "../components/speech/PromptSelector";
import ReactMarkdown from "react-markdown";
import { saveTranscriptToFirestore } from "@/app/lib/saveTranscript";
import TranscriptStats from "../components/speech/TranscriptStats";
import { TranscriptList } from "@/app/components/speech/TranscriptList";
import RecordingPromptPanel from "../components/speech/RecordingPromptPanel";
import { SummaryDisplay } from "../components/speech/SummaryDisplay";
import GraphSelector from "../components/speech/GraphSelector";
import GraphDisplay from "../components/speech/GraphDisplay";

export default function SpeechPage() {
  const [recording, setRecording] = useState(false);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [summary, setSummary] = useState<string>("");
  const [transcript, setTranscript] = useState<string>("");
  const [audioDuration, setAudioDuration] = useState<number | null>(null); // 音声の長さ
  const [gptUsage, setGptUsage] = useState<number | null>(null); // GPTのusage
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [promptType, setPromptType] = useState<PromptType>("simple");
  const [isCuntomPrompt, setIsCustomPrompt] = useState(false);
  const [customPrompt, setCustomPrompt] = useState("");
  const [isMarkdown, setIsMarkdown] = useState(false);
  const [graphType, setGraphType] = useState<
    "tokens" | "apiUsage" | "responseTime"
  >("tokens");

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

      // 音声の長さを取得
      const duration = await getAudioDuration(audioBlob);
      setAudioDuration(duration); // 音声の長さ（秒）

      const formData = new FormData();
      formData.append("audio", audioBlob, "audio.mp3"); // ← ファイル名だけ mp3 に変更
      formData.append("audio", audioBlob, "audio.webm");
      formData.append("duration", duration.toString());

      const res = await fetch("/api/whisper", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (data.text) {
        setTranscript(data.text);

        const summaryRes = await fetch("/api/chatgpt", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: data.text,
            prompt: isCuntomPrompt ? customPrompt : prompts[promptType],
          }),
        });

        const summaryData = await summaryRes.json();
        setGptUsage(summaryData.tokens); // GPTのusageを取得
        setSummary(summaryData.summary || "要約を取得できませんでした。");
        await saveTranscriptToFirestore({
          duration,
          promptType,
          customPrompt: isCuntomPrompt ? customPrompt : undefined,
          whisperText: data.text,
          chatGptSummary: summaryData.summary || "",
        });
      }
    };

    mediaRecorder.start();
    setRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  };

  // 音声の長さを取得する関数

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
      />

      <SummaryDisplay
        summary={summary}
        transcript={transcript}
        isMarkdown={promptType === "markdown"} // ← 条件に応じて切替
      />
      <TranscriptList />

      <div>
        <GraphDisplay />
      </div>
    </div>
  );
}
