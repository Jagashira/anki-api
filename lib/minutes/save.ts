import { db } from "../firebase";
import { doc, setDoc, Timestamp } from "firebase/firestore";

type ChunkLog = {
  id: number;
  status: "sending" | "success" | "error";
  text?: string;
  error?: string;
};

export const generateUniqueIdFromDate = (date: string) => {
  const createdAt = Timestamp.now();
  const formattedDate = date.replace(/-/g, "").split("T")[0];
  const createdAtMillis = createdAt.toMillis();
  return `${formattedDate}-${createdAtMillis}`;
};

export async function saveMinutes({
  summary,
  logs,
  prompt,
}: {
  summary: string;
  logs: ChunkLog[];
  prompt: string;
}): Promise<string> {
  const uniqueId = generateUniqueIdFromDate(new Date().toISOString());

  const docRef = doc(db, "minutes", uniqueId);

  await setDoc(docRef, {
    summary,
    logs,
    prompt,
    createdAt: Timestamp.now(),
  });

  return uniqueId;
}
