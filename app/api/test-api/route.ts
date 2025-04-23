import { NextRequest, NextResponse } from "next/server";
import { createReadStream } from "fs";
import { writeFile, unlink } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import formidable from "formidable";
import OpenAI from "openai";

export const config = {
  api: {
    bodyParser: false,
  },
};

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  const form = formidable({ multiples: false });

  const { fields, files }: any = await new Promise((resolve, reject) => {
    form.parse(req as any, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });

  const file = files.audio;
  if (!file) {
    return NextResponse.json(
      { error: "Audio file is required." },
      { status: 400 }
    );
  }

  const filePath = file[0].filepath || file[0].path;
  const fileName = `${uuidv4()}.mp3`;
  const newPath = path.join("/tmp", fileName);

  // Move file to /tmp if not already there
  await writeFile(newPath, createReadStream(filePath));

  try {
    const transcription = await openai.audio.transcriptions.create({
      file: createReadStream(newPath),
      model: "whisper-1",
      response_format: "json",
      language: "ja", // 日本語を指定
    });

    await unlink(newPath); // クリーンアップ

    return NextResponse.json({ text: transcription.text });
  } catch (err: any) {
    console.error("Whisper error:", err);
    return NextResponse.json(
      { error: "Transcription failed." },
      { status: 500 }
    );
  }
}
