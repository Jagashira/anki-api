// app/api/summary/route.ts

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
    // 2. フロントエンドからのデータ取得 (JSON形式)
    const body = await request.json();
    const { text, prompt } = body;

    if (!text || typeof text !== "string" || text.trim() === "") {
      return NextResponse.json(
        { error: "要約対象のテキストが必要です。" },
        { status: 400 } // Bad Request
      );
    }
    if (!prompt || typeof prompt !== "string" || prompt.trim() === "") {
      return NextResponse.json(
        { error: "要約用のプロンプトが必要です。" },
        { status: 400 } // Bad Request
      );
    }

    // 3. OpenAI Chat APIへのリクエスト準備
    const chatApiUrl = "https://api.openai.com/v1/chat/completions";
    // 使用するモデルを選択 (gpt-4o-mini, gpt-3.5-turboなど、予算や性能に応じて)
    const model = "gpt-3.5-turbo"; // 例: gpt-3.5-turbo, gpt-4o-miniなど

    // APIに送信するメッセージ配列を作成
    const messages = [
      {
        role: "system", // システムメッセージ: AIの役割や前提条件を指示
        content:
          "あなたは、与えられたテキストと指示に基づいて要約を作成する優秀なアシスタントです。指示に忠実に、かつ分かりやすい要約を生成してください。",
      },
      {
        role: "user", // ユーザーメッセージ: 具体的な指示と処理対象のテキスト
        content: `以下の「テキスト」を、「プロンプト」の指示に従って要約してください。\n\nプロンプト: "${prompt}"\n\nテキスト:\n"""\n${text}\n"""`,
      },
    ];

    // 4. OpenAI Chat APIへのリクエスト送信
    const response = await fetch(chatApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: model,
        messages: messages,
        // temperature: 0.7, // 応答の多様性（0.0で決定的、高いほど多様）お好みで調整
        // max_tokens: 1000,  // 生成される要約の最大長（トークン数）必要に応じて設定
      }),
    });

    // 5. OpenAI Chat APIからのレスポンス処理
    if (!response.ok) {
      const errorData = await response.json().catch(() => {
        return {
          error: {
            message: `APIリクエスト失敗。ステータス: ${response.status} ${response.statusText}`,
          },
        };
      });
      console.error("OpenAI Chat API Error Response:", errorData);
      return NextResponse.json(
        {
          error: `OpenAI Chat APIエラー: ${
            errorData.error?.message || response.statusText
          }`,
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    // レスポンスの形式を確認
    if (
      !data.choices ||
      data.choices.length === 0 ||
      !data.choices[0].message ||
      !data.choices[0].message.content
    ) {
      console.error("OpenAI Chat API Error: Invalid response structure", data);
      return NextResponse.json(
        { error: "OpenAI Chat APIからの応答形式が無効です。" },
        { status: 500 }
      );
    }

    const summaryText = data.choices[0].message.content.trim();

    // 6. 成功レスポンスをフロントエンドに返却
    return NextResponse.json({ summary: summaryText });
  } catch (error: any) {
    console.error("要約APIリクエスト処理中の予期せぬエラー:", error);
    if (error instanceof SyntaxError && error.message.includes("JSON")) {
      // JSONパースエラーの場合
      return NextResponse.json(
        { error: "リクエストボディのJSON形式が正しくありません。" },
        { status: 400 }
      );
    }
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
