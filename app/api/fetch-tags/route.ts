// app/api/fetch-tags/route.ts

import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    // AnkiConnect APIにPOSTリクエストを送信
    const response = await fetch("http://127.0.0.1:8765", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "getTags",
        version: 6,
        params: {},
      }),
    });

    const data = await response.json();

    // 成功した場合、タグを返す
    if (data.error) {
      return NextResponse.json({ error: data.error }, { status: 500 });
    }

    return NextResponse.json({ tags: data.result || [] });
  } catch (error) {
    console.error("AnkiConnect API呼び出しエラー:", error);
    return NextResponse.json(
      { error: "AnkiConnectからタグの取得に失敗しました" },
      { status: 500 }
    );
  }
}
