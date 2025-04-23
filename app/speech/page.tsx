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
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">リアルタイム録音</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4">
          <Button onClick={recording ? stopRecording : startRecording}>
            {recording ? "⏹ 録音停止" : "🎙 録音開始"}
          </Button>
        </CardContent>
      </Card>
      {/* PromptSelectorを使ってselectボタンを作成する */}
      <Card>
        <CardHeader>
          <CardTitle>📝 プロンプトを選択</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-800">
            録音した音声を要約するためのプロンプトを選択してください。
          </p>
          <PromptSelector
            promptType={promptType}
            setPromptType={setPromptType}
            customPrompt={customPrompt}
            setCustomPrompt={setCustomPrompt}
            setIsCustomPrompt={setIsCustomPrompt}
          />
        </CardContent>
      </Card>

      {/* 音声の長さ */}
      {audioDuration !== null && (
        <Card>
          <CardHeader>
            <CardTitle>🔊 音声の長さ</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-800">
              録音された音声の長さは {audioDuration.toFixed(2)} 秒です。
            </p>

            <p className="text-gray-800">
              Whisperのコストは約
              {calculateUsage(
                Number(audioDuration.toFixed(2)) * 142.044
              ).toFixed(2)}{" "}
              円 です。
            </p>
            <p className="text-gray-800">
              GPTのコストは約
              {gptUsage ? (gptUsage * 0.002).toFixed(2) : "計算中"} 円です。
            </p>
            <Button
              onClick={async () => {
                try {
                  const res = await fetch("/api/usageTotal");

                  // レスポンスのステータスコードを確認
                  if (!res.ok) {
                    throw new Error(`API Error: ${res.status}`);
                  }

                  // レスポンスボディを確認
                  const data = await res.json();

                  // データが正しいか確認
                  if (!data) {
                    throw new Error("No data returned from API.");
                  }

                  alert(JSON.stringify(data, null, 2));
                } catch (error) {
                  console.error("Error fetching usage:", error);
                  alert("Failed to fetch API usage data.");
                }
              }}
            >
              API Usageを表示
            </Button>
          </CardContent>
        </Card>
      )}

      {summary && (
        <Card>
          <CardHeader>
            <CardTitle>📝 要約結果</CardTitle>
          </CardHeader>
          <CardContent>
            {isMarkdown ? (
              <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                {summary}
              </p>
            ) : (
              <div className="prose prose-neutral max-w-none">
                <ReactMarkdown>{summary}</ReactMarkdown>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {transcript && (
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="transcript">
            <AccordionTrigger>📄 文字起こしを見る</AccordionTrigger>
            <AccordionContent>
              <div className="bg-gray-50 p-4 rounded-md text-sm whitespace-pre-wrap max-h-96 overflow-y-auto">
                {transcript}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}
      <TranscriptStats />
      <div className="p-6">
        <h1 className="text-xl font-bold mb-4">Transcript一覧</h1>
        <TranscriptList />
      </div>
    </div>
  );
}
