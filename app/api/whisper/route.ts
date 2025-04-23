import { NextRequest, NextResponse } from "next/server";
import { OpenAI } from "openai";
import ffmpegPath from "@ffmpeg-installer/ffmpeg";
import ffmpeg from "fluent-ffmpeg";
import fs from "fs";
import path from "path";
import os from "os";
import { v4 as uuidv4 } from "uuid";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ffmpeg パスを設定
ffmpeg.setFfmpegPath(ffmpegPath.path);

export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

export async function POST(req: NextRequest) {
  console.log("WHISPER_API--------------------");
  console.log("音声ファイルを受信しました。");
  let tempInputPath = "";
  let tempOutputPath = "";
  // CORS ヘッダーを追加

  try {
    const formData = await req.formData();
    const audioFile = formData.get("audio") as Blob;
    const durationStr = formData.get("duration") as string;
    const duration = parseFloat(durationStr || "0");

    if (!audioFile || !(audioFile instanceof Blob)) {
      return NextResponse.json(
        { error: "音声ファイルがありません。" },
        { status: 400 }
      );
    }

    // 一時ファイル保存
    const buffer = Buffer.from(await audioFile.arrayBuffer());
    const mimeType = audioFile.type;
    const inputExt = mimeType.split("/")[1] || "webm";
    tempInputPath = path.join(os.tmpdir(), `${uuidv4()}.${inputExt}`);
    tempOutputPath = path.join(os.tmpdir(), `${uuidv4()}.mp3`);
    fs.writeFileSync(tempInputPath, buffer);

    // ffmpeg で mp3 に変換
    await new Promise<void>((resolve, reject) => {
      ffmpeg(tempInputPath)
        .toFormat("mp3")
        .on("end", () => resolve())
        .on("error", reject)
        .save(tempOutputPath);
    });

    // mp3ファイルを読み込み
    const file = fs.createReadStream(tempOutputPath);

    // Whisper API で文字起こし
    const transcription = await openai.audio.transcriptions.create({
      file,
      model: "whisper-1",
      response_format: "json",
      language: "ja",
    });

    console.log("音声ファイルの長さ :", duration, "秒");
    console.log("音声ファイルのテキスト :", transcription.text);
    console.log("------------------------------");

    // 一時ファイル削除
    fs.unlinkSync(tempInputPath);
    fs.unlinkSync(tempOutputPath);

    return NextResponse.json(
      { text: transcription.text },
      { headers: { "Access-Control-Allow-Origin": "*" } }
    );
  } catch (error: any) {
    console.error("エラーが発生しました:", error);
    return NextResponse.json(
      { error: error.message || "変換・文字起こしに失敗しました。" },
      {
        status: 500,
        headers: { "Access-Control-Allow-Origin": "*" },
      }
    );
  } finally {
    // 最後にファイル削除を確実に行う
    if (fs.existsSync(tempInputPath)) {
      fs.unlinkSync(tempInputPath);
    }
    if (fs.existsSync(tempOutputPath)) {
      fs.unlinkSync(tempOutputPath);
    }
  }
}
