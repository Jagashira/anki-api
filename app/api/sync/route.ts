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
        action: "sync",
        version: 6,
      }),
    });

    const data = await response.json();

    if (data.error) {
      return NextResponse.json({ error: data.error }, { status: 500 });
    }
    return NextResponse.json({ result: data.result || null });
  } catch (error) {
    console.error("AnkiConnect API呼び出しエラー:", error);
    return NextResponse.json({ error: error }, { status: 500 });
  }
}
