// /api/chatgpt/route.ts
import { NextRequest, NextResponse } from "next/server";
import { OpenAI } from "openai";
import { ChatCompletionMessageParam } from "openai/resources/index.mjs";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  console.log("CHATGPT_API--------------------");
  console.log("テキストを受信しました。");
  console.log(
    "Date :",
    new Date().toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" })
  );
  const { text, prompt } = await req.json();

  if (!text || !prompt) {
    return NextResponse.json(
      { error: "Missing 'text' or 'prompt'" },
      { status: 400 }
    );
  }
  const messages: ChatCompletionMessageParam[] = [
    {
      role: "system",
      content: prompt,
    },
    {
      role: "user",
      content: text,
    },
  ];

  try {
    // ChatGPTに要約を依頼
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages,
    });

    //使用したmodelやrole,contentを出力

    console.log("使用したmodel :", response.model);
    console.log("text in GPT  :", text);
    console.log("prompt in GPT:", prompt);
    console.log("message      :", response.choices[0]?.message?.content);
    console.log("------------------------------");

    const summary = response.choices[0]?.message?.content;
    const tokens = response.usage?.total_tokens || 0;

    return NextResponse.json({ summary, tokens });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
