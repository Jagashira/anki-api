import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

export type Minutes = {
  id: string;
  summary: string;
  prompt: string;
  logs: {
    id: number;
    status: "sending" | "success" | "error";
    text?: string;
    error?: string;
  }[];
  createdAt?: { seconds: number };
};

export async function getMinutesById(id: string): Promise<Minutes | null> {
  const docRef = doc(db, "minutes", id);
  const snap = await getDoc(docRef);
  if (!snap.exists()) return null;

  const data = snap.data();
  return {
    id: snap.id,
    summary: data.summary,
    prompt: data.prompt,
    logs: data.logs || [],
    createdAt: data.createdAt,
  };
}
