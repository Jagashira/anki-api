import { db } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

// プロンプトの型定義
export type Prompt = {
  id: string;
  label: string;
  text: string;
};

// Firestore 上の設定データ型
export type Settings = {
  prompts: Prompt[];
  updatedAt: Date;
};

// Firestore のドキュメント参照（固定ID: "global"）
const settingsRef = doc(db, "settings", "global");

// ✅ 設定を取得
export async function getSettings(): Promise<Settings | null> {
  const snap = await getDoc(settingsRef);
  if (!snap.exists()) return null;

  const data = snap.data();
  return {
    prompts: data.prompts || [],
    updatedAt: data.updatedAt?.toDate?.() || new Date(),
  };
}

// ✅ 設定を保存
export async function saveSettings(data: Partial<Settings>): Promise<void> {
  await setDoc(
    settingsRef,
    {
      ...data,
      updatedAt: new Date(),
    },
    { merge: true }
  );
}
