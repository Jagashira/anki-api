import { NextResponse } from "next/server";
import OpenAI from "openai";
import { File } from "node-fetch"; // Node.js環境向けの File クラス

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function POST(req: Request) {
  const formData = await req.formData();
  const uploaded = formData.get("file") as File | null;

  if (!uploaded) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const arrayBuffer = await uploaded.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // node-fetch の File クラスで Whisper に渡せる FileLike を生成
  const nodeFile = new File([buffer], "chunk.webm", {
    type: "audio/webm;codecs=opus",
    lastModified: Date.now(),
  });

  try {
    const transcription = await openai.audio.transcriptions.create({
      file: nodeFile,
      model: "whisper-1",
      response_format: "text",
    });

    return new NextResponse(transcription);
  } catch (error) {
    console.error("❌ Whisper transcription failed:", error);
    return NextResponse.json(
      { error: "Transcription failed" },
      { status: 500 }
    );
  }
}
