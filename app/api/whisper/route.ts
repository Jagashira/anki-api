// app/api/whisper/route.ts
import { NextRequest, NextResponse } from "next/server";
import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*", // ← 運用ではドメインを指定推奨
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

export async function POST(req: NextRequest) {
  console.log("WHISPER_API--------------------");
  console.log("音声ファイルを受信しました。");
  console.log(
    "Date :",
    new Date().toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" })
  );
  try {
    const formData = await req.formData();
    const audioFile = formData.get("audio");
    const durationStr = formData.get("duration") as string;
    const duration = parseFloat(durationStr);

    if (!audioFile || !(audioFile instanceof Blob)) {
      console.log("音声ファイルがありません。");
      return NextResponse.json(
        { error: "音声ファイルがありません。" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await audioFile.arrayBuffer());

    const transcription = await openai.audio.transcriptions.create({
      file: new File([buffer], "audio.webm"),
      model: "whisper-1",
      response_format: "json",
      language: "ja",
    });

    console.log("使用したmodel :", "whisper-1");
    console.log("音声ファイルの長さ :", duration, "秒");
    console.log("音声ファイルのサイズ :", buffer.length, "バイト");
    console.log("音声ファイルのテキスト :", transcription.text);
    console.log("------------------------------");

    return NextResponse.json(
      { text: transcription.text },
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  } catch (error: any) {
    console.error("エラーが発生しました:", error);
    return NextResponse.json(
      { error: error.message },
      {
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }
}
