import { NextRequest, NextResponse } from "next/server";
import { OpenAI } from "openai";
import fs from "fs";
import path from "path";
import os from "os";
import { v4 as uuidv4 } from "uuid";
import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "@ffmpeg-installer/ffmpeg";

// OpenAI APIの設定
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ffmpegのパス設定
ffmpeg.setFfmpegPath(ffmpegPath.path);

// 音声ファイルを変換する関数
const convertAudioFile = async (audioFile: Blob): Promise<string> => {
  const buffer = Buffer.from(await audioFile.arrayBuffer());
  const mimeType = audioFile.type;

  // 拡張子をMIMEタイプから決定
  const extensionMap: Record<string, string> = {
    "audio/webm": "webm",
    "audio/wav": "wav",
    "audio/mpeg": "mp3",
    "audio/mp4": "mp4",
    "audio/x-m4a": "m4a",
    "audio/mp3": "mp3",
    "audio/ogg": "ogg",
    "audio/oga": "oga",
    "audio/mpga": "mpga",
    "audio/flac": "flac",
  };

  const extension = extensionMap[mimeType] || "mp3"; // fallback
  const tempInputPath = path.join(os.tmpdir(), `${uuidv4()}.${extension}`);
  const tempOutputPath = path.join(os.tmpdir(), `${uuidv4()}.mp3`);

  // 一時ファイルに保存
  fs.writeFileSync(tempInputPath, buffer);

  // WebMなどの形式をMP3に変換する
  if (extension !== "mp3") {
    await new Promise<void>((resolve, reject) => {
      ffmpeg(tempInputPath)
        .toFormat("mp3")
        .on("end", () => resolve())
        .on("error", reject)
        .save(tempOutputPath);
    });
  } else {
    fs.writeFileSync(tempOutputPath, buffer); // すでにMP3の場合はそのまま保存
  }

  return tempOutputPath; // 変換されたファイルのパス
};

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

    console.log("使用したmodel :", "whisper-1");
    console.log("音声ファイルの長さ :", duration, "秒");
    console.log(
      "音声ファイルのサイズ :",
      fs.statSync(tempOutputPath).size,
      "バイト"
    );
    console.log("音声ファイルのテキスト :", transcription.text);
    console.log("------------------------------");

    // 一時ファイル削除
    fs.unlinkSync(tempOutputPath);

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
