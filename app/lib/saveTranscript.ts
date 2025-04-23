// /lib/saveTranscript.ts
import { db } from "@/app/lib/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

type SaveTranscriptParams = {
  duration: number;
  promptType: string;
  customPrompt?: string;
  whisperText: string;
  chatGptSummary: string;
};

export const saveTranscriptToFirestore = async ({
  duration,
  promptType,
  customPrompt,
  whisperText,
  chatGptSummary,
}: SaveTranscriptParams) => {
  console.log("FIREBASE🔥--------------------");

  const docData: any = {
    duration,
    promptType,
    whisperText,
    chatGptSummary,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  if (promptType === "custom") {
    docData.customPrompt = customPrompt;
  }

  try {
    const docRef = await addDoc(collection(db, "transcripts"), docData);
    console.log("✅ Transcript saved with ID:", docRef.id);
    console.log("DocData:", docData);
    console.log("------------------------------");
  } catch (error) {
    console.error("❌ Error saving transcript to Firestore:", error);
    console.log("------------------------------");
    throw error; // 必要に応じて再スローして呼び出し元で処理
  }
};
