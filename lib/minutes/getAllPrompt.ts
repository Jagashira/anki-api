import { db } from "../firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";

export type Prompt = { id: string; text: string };

export async function getAllPrompts(): Promise<Prompt[]> {
  const q = query(collection(db, "prompts"), orderBy("updatedAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((doc) => ({
    id: doc.id,
    text: doc.data().text,
  }));
}
