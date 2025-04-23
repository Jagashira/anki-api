// /api/chatgpt/route.ts
import { NextRequest, NextResponse } from "next/server";
import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  const { text } = await req.json();

  if (!text) {
    return NextResponse.json(
      { error: "テキストが送信されていません。" },
      { status: 400 }
    );
  }

  try {
    // ChatGPTに要約を依頼
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "あなたは議事録作成の専門家です。以下の会話内容を簡潔に要約してください。",
        },
        {
          role: "user",
          content: text,
        },
      ],
    });

    const summary = response.choices[0]?.message?.content;
    const tokens = response.usage?.total_tokens || 0;
    console.log("ChatGPT APIからの応答:", response);

    return NextResponse.json({ summary, tokens });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
