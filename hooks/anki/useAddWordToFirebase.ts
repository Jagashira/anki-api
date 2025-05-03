// hooks/anki/useAddWordToFirebase.ts
import { Dispatch, SetStateAction } from "react";
import { prompts } from "@/lib/anki/definitions";
import { db } from "@/lib/anki/firebase"; // Adjust the import path as necessary
import { collection, addDoc, Timestamp } from "firebase/firestore";

interface AddWordToFirebaseParams {
  word: string;
  selectedTag: string | null;
  selectedDeck: string | null;
  setIsSubmitting: Dispatch<SetStateAction<boolean>>;
  setMessage: Dispatch<SetStateAction<string>>;
  setResult: Dispatch<SetStateAction<string>>;
  setimg: Dispatch<SetStateAction<string | null>>;
  setAudioSrc: Dispatch<SetStateAction<string | null>>;
  setWord: Dispatch<SetStateAction<string>>;
  language: "english" | "japanese";
}

export const addWordToFirebase = async ({
  word,
  selectedTag,
  selectedDeck,
  setIsSubmitting,
  setMessage,
  setResult,
  setimg,
  setAudioSrc,
  setWord,
  language,
}: AddWordToFirebaseParams) => {
  selectedDeck = "English";
  if (!word || !selectedDeck) {
    setMessage("😡 単語とデッキは必須です");
    return;
  }

  setIsSubmitting(true);

  try {
    const prompt = prompts[language].prompt(word);
    const res = await fetch("/api/anki/add-note", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        word,
        selectedTag,
        selectedDeck,
        prompt,
      }),
    });
    const data = await res.json();
    console.log("data", data);

    const newNote = {
      word,
      deck: selectedDeck,
      tag: selectedTag || null,
      data: data.content,
      createdAt: Timestamp.now(),
    };

    await addDoc(collection(db, "offlineWords"), newNote);

    setMessage("📦 Firebaseに保存しました");
    setResult(prompt);
    setWord("");
    setimg(null);
    setAudioSrc(null);
  } catch (error) {
    console.error("Firebase保存エラー:", error);
    setMessage("❌ Firebase保存中にエラーが発生しました");
  } finally {
    setIsSubmitting(false);
  }
};
