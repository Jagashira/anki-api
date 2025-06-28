// app/api/anki/chrome/route.ts

import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { zodToJsonSchema } from "zod-to-json-schema";
import { WordInfoSchema } from "@/lib/anki/schemas";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { word, prompt } = await req.json();

    console.log(`[DEBUG] Received word: "${word}¥n"`); // 受け取った単語をログに出力

    if (!word || !prompt) {
      return NextResponse.json(
        { error: "単語とプロンプトは必須です" },
        { status: 400 }
      );
    }
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OpenAI API キーが設定されていません" },
        { status: 500 }
      );
    }

    const { $schema, ...parameters } = zodToJsonSchema(WordInfoSchema);

    const tools: OpenAI.Chat.Completions.ChatCompletionTool[] = [
      {
        type: "function",
        function: {
          name: "show_word_info",
          description: "指定された英単語の詳細情報を表示する",
          parameters: parameters,
        },
      },
    ];

    console.log("[DEBUG] Calling OpenAI API...");
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      tools: tools,
      tool_choice: { type: "function", function: { name: "show_word_info" } },
    });

    const toolCalls = response.choices[0].message.tool_calls;

    // ▼▼▼ AIからの応答を詳細にログ出力 ▼▼▼
    console.log(
      "[DEBUG] OpenAI Raw Response:",
      JSON.stringify(toolCalls, null, 2)
    );

    if (!toolCalls) {
      console.error("[ERROR] AI did not return tool calls.");
      return NextResponse.json(
        { error: "ChatGPTが構造化データを生成できませんでした" },
        { status: 500 }
      );
    }

    const functionArgs = toolCalls[0].function.arguments;
    console.log("[DEBUG] AI Response Arguments (JSON String):", functionArgs);

    // JSON文字列をパース
    const parsedArgs = JSON.parse(functionArgs);

    // Zodスキーマで検証 (エラーでクラッシュしないsafeParseを使用)
    const validationResult = WordInfoSchema.safeParse(parsedArgs);

    console.log("[DEBUG] Zod Validation Result:", validationResult.success);

    if (!validationResult.success) {
      console.error(
        "[ERROR] Zod validation failed:",
        validationResult.error.errors
      );
      // Zodの検証エラーの詳細を返す
      return NextResponse.json(
        {
          error: "生成されたデータの形式が正しくありません",
          details: validationResult.error.flatten(),
        },
        { status: 500 }
      );
    }

    // 検証済みのJSONデータを返す
    return NextResponse.json(validationResult.data);
  } catch (error) {
    console.error("API Error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "不明なサーバーエラーです。";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
