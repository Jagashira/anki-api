import { db } from "../firebase";
import { doc, deleteDoc } from "firebase/firestore";

export async function deleteMinutes(id: string) {
  await deleteDoc(doc(db, "minutes", id));
}
