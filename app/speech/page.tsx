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
import { calculateUsage, getAudioDuration } from "@/app/lib/usage"; // 音声の長さを取得する関数をインポート

export default function SpeechPage() {
  const [recording, setRecording] = useState(false);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [summary, setSummary] = useState<string>("");
  const [transcript, setTranscript] = useState<string>("");
  const [audioDuration, setAudioDuration] = useState<number | null>(null); // 音声の長さ
  const [gptUsage, setGptUsage] = useState<number | null>(null); // GPTのusage
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

      // 音声の長さを取得
      const duration = await getAudioDuration(audioBlob);
      setAudioDuration(duration); // 音声の長さ（秒）

      const formData = new FormData();
      formData.append("audio", audioBlob, "audio.webm");

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
          body: JSON.stringify({ text: data.text }),
        });

        const summaryData = await summaryRes.json();
        setGptUsage(summaryData.tokens); // GPTのusageを取得
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
          </CardContent>
        </Card>
      )}

      {summary && (
        <Card>
          <CardHeader>
            <CardTitle>📝 要約結果</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
              {summary}
            </p>
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
    </div>
  );
}
