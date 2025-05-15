// components/RecordingPromptPanel.tsx
"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PromptSelector, PromptType } from "./PromptSelector";
import { Mic, StopCircle } from "lucide-react";
import AudioVisualizer from "./AudioVisualizer";

interface Props {
  promptType: PromptType;
  setPromptType: (value: PromptType) => void;
  customPrompt: string;
  setCustomPrompt: (value: string) => void;
  setIsCustomPrompt: (value: boolean) => void;
  startRecording: () => void;
  stopRecording: () => void;
  recording: boolean;
  audioStream: MediaStream | null;
  recordingTime: number;
}

export default function RecordingPromptPanel({
  promptType,
  setPromptType,
  customPrompt,
  setCustomPrompt,
  setIsCustomPrompt,
  startRecording,
  stopRecording,
  recording,
  audioStream,
  recordingTime,
}: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">🎤 録音 & プロンプト選択</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-6">
          {/* 録音コントロール */}
          <div className="flex-1 space-y-2">
            <p className="font-medium text-gray-700 flex items-center gap-2">
              {!recording ? (
                <>🎙 録音</>
              ) : (
                <>
                  ⏳ 録音中：
                  {Math.floor(recordingTime / 60)
                    .toString()
                    .padStart(2, "0")}
                  :{(recordingTime % 60).toString().padStart(2, "0")}
                </>
              )}
            </p>

            <Button
              onClick={recording ? stopRecording : startRecording}
              className="w-full text-lg"
            >
              {recording ? "⏹ 録音停止" : "🎙 録音開始"}
            </Button>

            {recording && (
              <AudioVisualizer audioStream={audioStream} active={recording} />
            )}
          </div>

          {/* プロンプト選択 */}
          <div className="flex-1 space-y-2">
            <p className="font-medium text-gray-700">プロンプト</p>
            <PromptSelector
              promptType={promptType}
              setPromptType={setPromptType}
              customPrompt={customPrompt}
              setCustomPrompt={setCustomPrompt}
              setIsCustomPrompt={setIsCustomPrompt}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
