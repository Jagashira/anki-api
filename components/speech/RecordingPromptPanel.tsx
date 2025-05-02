// components/RecordingPromptPanel.tsx
"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PromptSelector, PromptType } from "./PromptSelector";
import { Mic, StopCircle } from "lucide-react";

interface Props {
  promptType: PromptType;
  setPromptType: (value: PromptType) => void;
  customPrompt: string;
  setCustomPrompt: (value: string) => void;
  setIsCustomPrompt: (value: boolean) => void;
  startRecording: () => void;
  stopRecording: () => void;
  recording: boolean;
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
            <p className="font-medium text-gray-700">録音</p>
            <Button
              onClick={recording ? stopRecording : startRecording}
              className="w-full text-lg"
            >
              {recording ? "⏹ 録音停止" : "🎙 録音開始"}
            </Button>
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
