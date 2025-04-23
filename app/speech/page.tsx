"use client";

import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  prompts,
  PromptSelector,
  PromptType,
} from "../components/speech/PromptSelector";
import ReactMarkdown from "react-markdown";
import { saveTranscriptToFirestore } from "@/app/lib/saveTranscript";
import { calculateUsage, getAudioDuration } from "@/app/lib/usage";
import TranscriptStats from "../components/speech/TranscriptStats";
import { TranscriptList } from "@/app/components/speech/TranscriptList";
import { Accordion, AccordionItem } from "@mantine/core";
import { AccordionContent, AccordionTrigger } from "@radix-ui/react-accordion";

export default function SpeechPage() {
  const [recording, setRecording] = useState(false);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [summary, setSummary] = useState<string>("");
  const [transcript, setTranscript] = useState<string>("");
  const [audioDuration, setAudioDuration] = useState<number | null>(null);
  const [gptUsage, setGptUsage] = useState<number | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserNodeRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const [promptType, setPromptType] = useState<PromptType>("simple");
  const [isCustomPrompt, setIsCustomPrompt] = useState(false);
  const [customPrompt, setCustomPrompt] = useState("");

  const startRecording = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        // getUserMediaがサポートされている場合、通常の録音を行う
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
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
          setAudioDuration(duration);

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
                prompt: isCustomPrompt ? customPrompt : prompts[promptType],
              }),
            });

            const summaryData = await summaryRes.json();
            setGptUsage(summaryData.tokens);
            setSummary(summaryData.summary || "要約を取得できませんでした。");

            await saveTranscriptToFirestore({
              duration,
              promptType,
              customPrompt: isCustomPrompt ? customPrompt : undefined,
              whisperText: data.text,
              chatGptSummary: summaryData.summary || "",
            });
          }
        };

        mediaRecorder.start();
        setRecording(true);
      } else {
        // getUserMediaがサポートされていない場合、AudioContextで録音開始
        audioContextRef.current = new AudioContext();
        mediaStreamRef.current = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });

        const analyser = audioContextRef.current.createAnalyser();
        analyserNodeRef.current = analyser;
        const mediaStreamSource =
          audioContextRef.current.createMediaStreamSource(
            mediaStreamRef.current
          );
        mediaStreamSource.connect(analyser);

        // Web Audio APIで音声を取得して録音（未実装: 音声データ保存処理）

        setRecording(true);
      }
    } catch (error) {
      console.error("録音に失敗しました", error);
      alert(
        "録音の開始に失敗しました。マイクのアクセス許可を確認してください。"
      );
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    audioContextRef.current?.close();
    setRecording(false);
  };

  useEffect(() => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert("このブラウザは録音機能をサポートしていません。");
    }
  }, []);

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
            <div className="prose prose-neutral max-w-none">
              <ReactMarkdown>{summary}</ReactMarkdown>
            </div>
          </CardContent>
        </Card>
      )}

      {transcript && (
        //@ts-ignore
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
