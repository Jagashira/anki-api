"use client";

import PromptEditor, { Prompt } from "./PromptEditor";
import { saveSettings } from "@/lib/minutes/settings";

export default function PromptEditorWrapper({
  prompts,
}: {
  prompts: Prompt[];
}) {
  return (
    <PromptEditor
      initialPrompts={prompts}
      onSave={async (prompts) => {
        await saveSettings({ prompts });
      }}
    />
  );
}
