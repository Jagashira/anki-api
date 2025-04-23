// /api/whisper/route.ts
import { NextRequest, NextResponse } from "next/server";
import { OpenAI } from "openai";
import { Readable } from "stream";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_SPEECH_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const audioFile = formData.get("audio");

    if (!audioFile || !(audioFile instanceof Blob)) {
      console.log("音声ファイルがありません。");
      return NextResponse.json(
        { error: "音声ファイルがありません。" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await audioFile.arrayBuffer());

    // Whisper API にリクエスト
    const transcription = await openai.audio.transcriptions.create({
      file: new File([buffer], "audio.webm"),
      model: "whisper-1", // モデル名を確認
      response_format: "json",
      language: "ja", // 日本語
    });

    console.log("Whisper APIからの応答:", transcription);

    return NextResponse.json({ text: transcription.text });
  } catch (error: any) {
    console.error("エラーが発生しました:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
