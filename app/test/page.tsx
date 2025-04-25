"use client";
import React, { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SpeechPage() {
  const [webmURL, setWebmURL] = useState<string | null>(null);
  const [mp3URL, setMp3URL] = useState<string | null>(null);
  const [recording, setRecording] = useState(false);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [summary, setSummary] = useState<string>("");
  const [transcript, setTranscript] = useState<string>("");
  const [audioDuration, setAudioDuration] = useState<number | null>(null); // 音声の長さ
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

      // 音声ファイルを送信
      const formData = new FormData();
      formData.append("audio", audioBlob, "audio.webm");
      const res = await fetch("/api/test-api", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (data.text) {
        setTranscript(data.text);
        setWebmURL(data.webmUrl);
        setMp3URL(data.mp3Url);
      }
    };

    mediaRecorder.start();
    setRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  };

  useEffect(() => {
    return () => {
      // コンポーネントアンマウント時に不要なBlob URLを解放
      if (webmURL) URL.revokeObjectURL(webmURL);
      if (mp3URL) URL.revokeObjectURL(mp3URL);
    };
  }, [webmURL, mp3URL]);

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

      {/* 音声の再生 */}
      {(webmURL || mp3URL) && (
        <Card>
          <CardHeader>
            <CardTitle>🎧 音声の再生</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {webmURL && (
              <div>
                <p className="text-gray-800 font-semibold">🎙 WebM録音:</p>
                <audio controls src={webmURL} className="w-full" />
              </div>
            )}
            {mp3URL && (
              <div>
                <p className="text-gray-800 font-semibold">🎶 MP3変換後:</p>
                <audio controls src={mp3URL} className="w-full" />
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
