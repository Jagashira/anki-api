// app/api/fetch-decks/route.ts

import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    // AnkiConnectにリクエストを送信してデッキ名を取得
    const response = await fetch("http://127.0.0.1:8765", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "deckNames",
        version: 6,
        params: {},
      }),
    });

    const data = await response.json();

    if (data.error) {
      console.error("AnkiConnectからのエラー:", data.error);
      return NextResponse.json({ error: data.error }, { status: 500 });
    }

    // デッキ名を返す
    console.log("デッキの取得に成功しました");
    console.log("取得したデッキ名:", data.result);
    return NextResponse.json({ decks: data.result });
  } catch (error) {
    console.error("デッキ名の取得に失敗:", error);
    return NextResponse.json(
      { error: "デッキ名の取得に失敗しました" },
      { status: 500 }
    );
  }
}
