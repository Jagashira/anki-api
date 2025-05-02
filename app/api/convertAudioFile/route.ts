import fs from "fs";
import path from "path";
import os from "os";
import { v4 as uuidv4 } from "uuid";
import ffmpeg from "fluent-ffmpeg";
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const convertAudioFile = async (audioFile: Blob): Promise<string> => {
  const buffer = Buffer.from(await audioFile.arrayBuffer());
  const mimeType = audioFile.type;
  const inputExt = mimeType.includes("webm") ? "webm" : "mp3"; // webmならwebm、それ以外はmp3
  const tempInputPath = path.join(os.tmpdir(), `${uuidv4()}.${inputExt}`);
  const tempOutputPath = path.join(os.tmpdir(), `${uuidv4()}.mp3`);

  // 一時ファイルとして保存
  fs.writeFileSync(tempInputPath, buffer);

  // webmならmp3に変換
  if (inputExt === "webm") {
    await new Promise<void>((resolve, reject) => {
      ffmpeg(tempInputPath)
        .toFormat("mp3")
        .on("end", () => resolve())
        .on("error", reject)
        .save(tempOutputPath);
    });
  } else {
    // mp3や他の形式はそのまま使用
    fs.writeFileSync(tempOutputPath, buffer);
  }

  // 最終的なファイルパスを返す
  return tempOutputPath;
};

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const audioFile = formData.get("audio") as Blob;

    if (!audioFile || !(audioFile instanceof Blob)) {
      return NextResponse.json(
        { error: "音声ファイルがありません。" },
        { status: 400 }
      );
    }

    // 音声ファイルを変換
    const tempOutputPath = await convertAudioFile(audioFile);

    const file = fs.createReadStream(tempOutputPath);

    // Whisper APIで文字起こし
    const transcription = await openai.audio.transcriptions.create({
      file,
      model: "whisper-1",
      response_format: "json",
      language: "ja",
    });

    console.log("音声ファイルのテキスト:", transcription.text);

    // 一時ファイル削除
    fs.unlinkSync(tempOutputPath);

    return NextResponse.json(
      { text: transcription.text },
      {
        headers: { "Access-Control-Allow-Origin": "*" },
      }
    );
  } catch (error: any) {
    console.error("エラーが発生しました:", error);
    return NextResponse.json(
      { error: error.message || "変換・文字起こしに失敗しました。" },
      { status: 500, headers: { "Access-Control-Allow-Origin": "*" } }
    );
  }
}
