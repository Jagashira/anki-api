import { NextRequest, NextResponse } from "next/server";
import { db } from "@lib/anki/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";

export async function GET(req: NextRequest) {
  try {
    const q = query(
      collection(db, "pendingWords"),
      orderBy("createdAt", "desc")
    );
    const snapshot = await getDocs(q);

    const words = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    console.log("未同期単語数:", words.length);

    return NextResponse.json({ words });
  } catch (error) {
    console.error("未同期単語の取得エラー:", error);
    return NextResponse.json(
      { error: "未同期の単語リストの取得に失敗しました" },
      { status: 500 }
    );
  }
}
