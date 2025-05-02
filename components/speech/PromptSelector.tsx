"use client";
import dynamic from "next/dynamic";

import { Label } from "@/components/ui/label";
const Select = dynamic(
  () => import("@/components/ui/select").then((mod) => mod.Select),
  { ssr: false }
);
const SelectTrigger = dynamic(
  () => import("@/components/ui/select").then((mod) => mod.SelectTrigger),
  { ssr: false }
);
const SelectValue = dynamic(
  () => import("@/components/ui/select").then((mod) => mod.SelectValue),
  { ssr: false }
);
const SelectContent = dynamic(
  () => import("@/components/ui/select").then((mod) => mod.SelectContent),
  { ssr: false }
);
const SelectItem = dynamic(
  () => import("@/components/ui/select").then((mod) => mod.SelectItem),
  { ssr: false }
);
import { Textarea } from "@/components/ui/textarea";

export type PromptType =
  | "simple"
  | "formal"
  | "markdown"
  | "lecture"
  | "custom";

interface PromptSelectorProps {
  promptType: PromptType;
  setPromptType: (value: PromptType) => void;
  customPrompt: string;
  setCustomPrompt: (value: string) => void;
  setIsCustomPrompt: (value: boolean) => void;
}

export const prompts: Record<PromptType, string> = {
  simple:
    "以下の会話内容を簡潔に要約してください。主なポイントや話題だけを抜き出してください。",
  formal:
    "以下の会話をもとに、日時・議題・決定事項・次回の課題の5つの項目に分けて、議事録を作成してください。文体はビジネス用途を想定した丁寧な日本語で書いてください。",
  markdown:
    "以下の内容を基に、Markdown形式で議事録を作成してください。構成は以下に従ってください：\n\n## 議事録\n- **日時**：\n- **参加者**：\n- **議題**：\n- **議論内容**：\n- **決定事項**：\n- **次回の課題**：",
  lecture:
    "以下の内容は大学の授業の講義録です。学生が復習しやすいように、重要なキーワードや概念を中心にまとめ、わかりやすい文章で要点を簡潔に整理してください。箇条書きでの説明を優先してください。",
  custom: "",
};

export const PromptSelector = ({
  promptType,
  setPromptType,
  customPrompt,
  setCustomPrompt,
  setIsCustomPrompt,
}: PromptSelectorProps) => {
  return (
    <div className="space-y-4">
      <Label htmlFor="prompt">プロンプトを選択</Label>
      <Select
        value={promptType}
        onValueChange={(value) => {
          setPromptType(value as PromptType);
          //@ts-ignore
          setIsCustomPrompt(value === "custom");
        }}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="プロンプトを選択" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="simple">📝 簡易的な要約</SelectItem>
          <SelectItem value="formal">📋 議事録（丁寧）</SelectItem>
          <SelectItem value="markdown">📄 Markdown形式</SelectItem>
          <SelectItem value="lecture">🎓 大学の講義要約</SelectItem>
          <SelectItem value="custom">✍️ 自由入力</SelectItem>
        </SelectContent>
      </Select>

      {promptType === "custom" && (
        <Textarea
          placeholder="独自のプロンプトを入力"
          value={customPrompt}
          onChange={(e) => setCustomPrompt(e.target.value)}
          className="min-h-[120px]"
        />
      )}
    </div>
  );
};
