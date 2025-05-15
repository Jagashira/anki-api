import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";

export async function getUsageSummary() {
  const snapshot = await getDocs(collection(db, "minutes"));
  const all = snapshot.docs.map((doc) => doc.data());

  const whisperChunks = all.reduce(
    (sum, doc) => sum + (doc.logs?.length || 0),
    0
  );
  const gptCalls = all.length;
  const tokens = gptCalls * 1500; // 仮に1回1500tokensと仮定
  const estimatedCostYen = Math.round(tokens * 0.002 * 100) / 100; // $0.002/token → 円換算（仮に$1=100円）

  return {
    whisperChunks,
    gptCalls,
    tokens,
    estimatedCostYen,
  };
}
