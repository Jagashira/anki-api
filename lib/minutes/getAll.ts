// lib/minutes/getAll.ts
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";

export type Minutes = {
  id: string;
  summary: string;
  prompt: string;
  createdAt?: { seconds: number }; // Timestamp だけ使うならこれでOK
};

export async function getAllMinutes(): Promise<Minutes[]> {
  const snapshot = await getDocs(collection(db, "minutes"));
  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      summary: data.summary,
      prompt: data.prompt,
      createdAt: data.createdAt,
    };
  });
}
