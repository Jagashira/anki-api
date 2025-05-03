import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/anki/firebase";
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

export async function POST(req: NextRequest) {
  try {
    const { word, selectedTag, selectedDeck, prompt } = await req.json();

    // ✅ 入力チェック
    if (!word) {
      console.log("🙅‍♀️wordが空です");
      return NextResponse.json(
        { error: "単語が入力されていません" },
        { status: 400 }
      );
    }
    // ✅ デッキ名チェック
    if (!selectedDeck) {
      console.log("🙅‍♀️デッキ名が空です");
      return NextResponse.json(
        { error: "デッキ名が選択されていません" },
        { status: 400 }
      );
    }
    // ✅ OpenAIのAPIキーが設定されているか確認
    const openAiKey = process.env.OPENAI_API_KEY;
    if (!openAiKey) {
      console.log("🙅‍♀️openAiKeyが空です");
      return NextResponse.json(
        { error: "OpenAI API キーが設定されていません" },
        { status: 500 }
      );
    }

    //  ChatGPTで意味生成
    const openAiRes = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openAiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.7,
        }),
      }
    );

    const openAiData = await openAiRes.json();
    const generated = openAiData?.choices?.[0]?.message?.content;

    // Dateの有無
    if (!generated) {
      console.log("🙅‍♀️意味の取得に失敗");
      return NextResponse.json(
        { error: "意味の取得に失敗しました" },
        { status: 500 }
      );
    }

    // 🔤 HTML整形
    const formattedGenerated = generated
      .replace(/（/g, "(")
      .replace(/）/g, ")")
      .replace(/\n+/g, "<br>")
      .replace(/([^\n]+)(\n)?/g, "$1<br> ");

    // 📥 Firebaseへ保存
    const docRef = await addDoc(collection(db, "pendingWords"), {
      word,
      selectedTag,
      selectedDeck,
      formattedContent: formattedGenerated,
      createdAt: serverTimestamp(),
      synced: false,
    });
    console.log("Firebaseに保存:", docRef.id);

    return NextResponse.json({
      message: "Firebaseに保存しました",
      id: docRef.id,
      content: formattedGenerated,
      image: null,
      audio: null,
    });
  } catch (error) {
    console.error("🙅‍♀️Firebase保存エラー:", error);
    return NextResponse.json(
      { error: "Firebaseへの保存に失敗しました" },
      { status: 500 }
    );
  }
}
