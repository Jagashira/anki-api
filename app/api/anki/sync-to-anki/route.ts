// app/api/firebase/sync-word-to-anki/route.ts
import { db } from "@/lib/anki/firebase";
import { doc, deleteDoc, getDoc } from "firebase/firestore";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { wordId } = await req.json();
    const docRef = doc(db, "pendingWords", wordId);
    const snapshot = await getDoc(docRef);

    if (!snapshot.exists()) {
      return NextResponse.json(
        { error: "単語が見つかりません" },
        { status: 404 }
      );
    }

    const data = snapshot.data();
    const { word, selectedDeck, selectedTag, formattedContent } = data;
    // 安全性のため、selectedTag を必ず配列にする（undefined を防ぐ）
    const safeTag =
      typeof selectedTag === "string" && selectedTag.trim() !== ""
        ? [selectedTag]
        : [];

    // word や formattedContent が空でないかチェック
    if (!word || !formattedContent || !selectedDeck) {
      return NextResponse.json(
        { error: "必要なデータが不足しています" },
        { status: 400 }
      );
    }

    // 🔁 /anki/add/note にリクエストを送信
    const res = await fetch("http://localhost:3000/api/anki/fetchAudioImage", {
      method: "POST",
      body: JSON.stringify({ word, selectedDeck }),
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) {
      const errorResult = await res.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorResult.error || "音声または画像の取得に失敗しました" },
        { status: 500 }
      );
    }

    const result = await res.json();
    const { image, audio } = result;
    const { base64: base64Image, fileName: imageFileName } = image;
    const { base64: base64Audio, fileName: audioFileName } = audio;

    // AnkiConnect: 画像の保存
    await fetch("http://127.0.0.1:8765", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "storeMediaFile",
        version: 6,
        params: {
          filename: imageFileName,
          data: base64Image,
        },
      }),
    });
    const formattedGenerated =
      formattedContent +
      `<br><img src="${imageFileName}" alt="${word}"><br><br>` +
      `<audio controls><source src="data:audio/mp3;base64,${base64Audio}" type="audio/mp3"></audio>`;

    const ankiRes = await fetch("http://127.0.0.1:8765", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "addNote",
        version: 6,
        params: {
          note: {
            deckName: selectedDeck,
            modelName: "Basic",
            fields: {
              Front: word,
              Back: formattedGenerated,
            },
            tags: safeTag,
          },
        },
      }),
    });
    const ankiResult = await ankiRes.json();
    console.log("Ankiの結果:", ankiResult);
    if (!ankiRes.ok) {
      return NextResponse.json(
        { error: ankiResult.error || "Ankiへの追加に失敗しました" },
        { status: 500 }
      );
    }
    // Ankiに追加されたか確認
    if (ankiResult.error) {
      return NextResponse.json(
        { error: ankiResult.error || "Ankiへの追加に失敗しました" },
        { status: 500 }
      );
    }

    // ✅ Firebaseから削除
    await deleteDoc(docRef);

    return NextResponse.json({ message: `${word} をAnkiに同期しました` });
  } catch (error: any) {
    console.error("同期処理中にエラー:", error);
    return NextResponse.json(
      { error: "サーバーエラーが発生しました" },
      { status: 500 }
    );
  }
}
