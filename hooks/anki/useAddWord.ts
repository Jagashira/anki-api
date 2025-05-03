// hooks/anki/useAddWord.ts
import { Dispatch, SetStateAction } from "react";
import { prompts } from "@/lib/anki/definitions";

interface AddWordParams {
  word: string;
  selectedTag: string | null;
  selectedDeck: string | null;
  setIsSubmitting: Dispatch<SetStateAction<boolean>>;
  setMessage: Dispatch<SetStateAction<string>>;
  setResult: Dispatch<SetStateAction<string>>;
  setimg: Dispatch<SetStateAction<string | null>>;
  setAudioSrc: Dispatch<SetStateAction<string | null>>;
  setWord: Dispatch<SetStateAction<string>>;
  setNotes: Dispatch<SetStateAction<any[]>>;
  language: "english" | "japanese";
  isAnkiConnected: boolean;
}
export const addWord = async ({
  word,
  selectedTag,
  selectedDeck,
  setIsSubmitting,
  setMessage,
  setResult,
  setimg,
  setAudioSrc,
  setWord,
  setNotes,
  language,
  isAnkiConnected,
}: AddWordParams) => {
  selectedDeck = "English Word";
  if (!word || !selectedDeck) {
    setMessage("😡 単語とデッキは必須です");
    return;
  }

  setIsSubmitting(true);

  try {
    if (isAnkiConnected) {
      // Ankiに送信
      const res = await fetch("/api/anki/add-note", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          word,
          selectedTag,
          selectedDeck,
          prompt: prompts[language].prompt(word),
        }),
      });

      const data = await res.json();

      if (data.audio?.base64) {
        setAudioSrc(`data:audio/mp3;base64,${data.audio.base64}`);
      }

      if (res.ok) {
        setMessage("🥰 " + data.message);
        setResult(data.content);
        setimg(`data:image/jpeg;base64,${data.image?.base64}`);
        setWord("");

        if (data.duplicateNote) {
          setNotes((prev) => [
            data.duplicateNote,
            ...prev.filter((n) => n.noteId !== data.duplicateNote.noteId),
          ]);
          setMessage("🫥 " + data.message);
        }
      } else {
        setMessage("😡 " + data.error);
        setResult("");
      }
    } else {
      // Firebaseに保存
      const firebaseRes = await fetch("/api/anki/add-note-firebase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          word,
          selectedTag,
          selectedDeck,
          prompt: prompts[language].prompt(word),
          language,
        }),
      });

      const firebaseData = await firebaseRes.json();

      if (firebaseRes.ok) {
        setMessage("📦 オフライン保存しました");
        setResult(firebaseData.content);
        setWord("");
        // オフライン用ノートもUIに表示する場合:
        setNotes((prev) => [
          {
            noteId: "firebase-" + Date.now(),
            fields: {
              Front: { value: word }, // word を Front に設定
              Back: { value: firebaseData.content }, // firebaseData.prompt を Back に設定
            },
            tags: selectedTag ? [selectedTag] : [],
          },
          ...prev,
        ]);
      } else {
        setMessage("😡 Firebase保存エラー: " + firebaseData.error);
      }
    }
  } catch (error) {
    console.error(error);
    setMessage("❌ エラーが発生しました");
  } finally {
    setIsSubmitting(false);
  }
};
