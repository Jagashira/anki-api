// app/api/whisper/route.ts

import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  // 1. APIキーの確認
  const openaiApiKey = process.env.OPENAI_API_KEY;
  if (!openaiApiKey) {
    console.error("OpenAI APIキーが設定されていません。");
    return NextResponse.json(
      { error: "サーバー設定エラー: OpenAI APIキーが必要です。" },
      { status: 500 }
    );
  }

  try {
    // 2. フロントエンドからの音声ファイル取得
    const requestFormData = await request.formData();
    const audioFile = requestFormData.get("file") as File | null;

    if (!audioFile) {
      return NextResponse.json(
        { error: "音声ファイルが見つかりません。" },
        { status: 400 } // Bad Request
      );
    }

    // 3. Whisper APIへのリクエスト準備
    const whisperFormData = new FormData();
    // Fileオブジェクトをそのまま追加できます。ファイル名も引き継がれます。
    whisperFormData.append("file", audioFile);
    whisperFormData.append("model", "whisper-1"); // 使用するモデルを指定
    // whisperFormData.append('language', 'ja'); // 必要に応じて言語コードを指定 (例: 日本語)
    // whisperFormData.append('prompt', 'これは議事録です。'); // 必要に応じてプロンプトで精度向上を試みる
    // whisperFormData.append('response_format', 'json'); // デフォルトはjson

    const whisperApiUrl = "https://api.openai.com/v1/audio/transcriptions";

    // 4. Whisper APIへのリクエスト送信
    const response = await fetch(whisperApiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openaiApiKey}`,
      },
      body: whisperFormData,
    });

    // 5. Whisper APIからのレスポンス処理
    if (!response.ok) {
      // ★★★ここから修正・詳細化★★★
      const responseBodyText = await response.text(); // まずレスポンスボディをテキストとして取得
      console.error(
        `Whisper API Error - Status: ${response.status} ${response.statusText}`
      );
      console.error("Whisper API Error - Raw Response Body:", responseBodyText); // 生のレスポンスボディをログに出力

      let errorJson;
      try {
        errorJson = JSON.parse(responseBodyText); // テキストからJSONへのパースを試みる
      } catch (e) {
        // JSONパースに失敗した場合 (レスポンスがJSONではない場合)
        console.error(
          "Whisper API Error - Failed to parse response body as JSON:",
          e
        );
        errorJson = {
          error: {
            message: `API request failed, non-JSON response received. Body starts with: "${responseBodyText.substring(
              0,
              100
            )}..."`,
          },
        };
      }

      return NextResponse.json(
        {
          error: `Whisper APIエラー: ${
            errorJson.error?.message || response.statusText
          }`,
        },
        { status: response.status }
      );
      // ★★★ここまで修正・詳細化★★★
    }

    const data = await response.json(); // openAIResponseはOpenAI APIからのレスポンス変数名と仮定

    // フロントエンドに返す前に、data.text の内容を確認するログを追加するのも有効です
    console.log("OpenAI Whisper API response text:", data.text);

    // 6. 成功レスポンスをフロントエンドに返却
    return NextResponse.json({ text: data.text }); // ✅ この形式である必要があります
  } catch (error: any) {
    // 予期せぬサーバー内部エラー
    console.error("Whisper APIリクエスト処理中の予期せぬエラー:", error);
    return NextResponse.json(
      {
        error: `リクエスト処理エラー: ${
          error.message || "不明なサーバーエラーが発生しました。"
        }`,
      },
      { status: 500 } // Internal Server Error
    );
  }
}
