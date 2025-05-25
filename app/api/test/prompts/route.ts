// app/api/prompts/route.ts

import { NextResponse } from "next/server";

export async function GET() {
  try {
    // ここでは固定のデフォルトプロンプトを定義しています。
    // 将来的には、この部分をデータベースから読み込んだり、
    // 設定ファイルから取得したりするように拡張できます。
    const defaultPrompt =
      "この会議の主要な論点、決定事項、および各自のタスク（ネクストアクション）について、箇条書きで簡潔にまとめてください。";

    // JSON形式でプロンプトをレスポンスとして返します。
    return NextResponse.json({ prompt: defaultPrompt });
  } catch (error) {
    // エラーハンドリング
    console.error("Error fetching default prompt:", error);
    return NextResponse.json(
      { error: "デフォルトプロンプトの取得中にエラーが発生しました。" },
      { status: 500 } // Internal Server Error
    );
  }
}
