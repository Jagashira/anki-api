import { NextRequest, NextResponse } from "next/server"; // NextRequestとNextResponseをインポート
import axios from "axios";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY; // 環境変数でAPIキーを管理

export async function POST(req: NextRequest) {
  // 引数をNextRequestに変更
  try {
    const response = await axios.get("https://api.openai.com/v1/usage", {
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
    });
    console.log("Usage data:", response.data);

    // NextResponseを使ってレスポンスを返す
    return NextResponse.json(response.data || {}, { status: 200 });
  } catch (error) {
    console.error("Error fetching usage:", error);
    return NextResponse.json(
      { error: "Failed to fetch usage" },
      { status: 500 }
    );
  }
}
