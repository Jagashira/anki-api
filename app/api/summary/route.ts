import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function POST(req: Request) {
  const { text } = await req.json();

  const gpt = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content:
          "あなたは優秀な議事録作成AIです。以下の会話内容を読みやすく要約してください。箇条書きでも可です。",
      },
      {
        role: "user",
        content: text,
      },
    ],
  });

  return NextResponse.json({ summary: gpt.choices[0].message.content });
}
