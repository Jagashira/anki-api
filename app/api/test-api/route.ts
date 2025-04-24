// /pages/api/test-api.ts

import fs from "fs";
import path from "path";
import os from "os";
import { v4 as uuidv4 } from "uuid";
import ffmpeg from "fluent-ffmpeg";
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

// OpenAIのAPIキーを使ってOpenAIインスタンスを作成
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 音声ファイルをWebMまたはMP3に変換する関数
const convertAudioFile = async (
  audioFile: Blob
): Promise<{ webmPath: string; mp3Path: string }> => {
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

  // webmとmp3のファイルパスを返す
  return { webmPath: tempInputPath, mp3Path: tempOutputPath };
};

// 変換された音声ファイル（WebMとMP3）を保存してURLを返す関数
const saveAudioFiles = async (
  audioBlob: Blob
): Promise<{ webmUrl: string; mp3Url: string }> => {
  const webmPath = path.join(os.tmpdir(), `${uuidv4()}.webm`);
  const mp3Path = path.join(os.tmpdir(), `${uuidv4()}.mp3`);

  // BlobをWebMファイルとして保存
  fs.writeFileSync(webmPath, Buffer.from(await audioBlob.arrayBuffer()));

  // WebMをMP3に変換
  await new Promise<void>((resolve, reject) => {
    ffmpeg(webmPath)
      .toFormat("mp3")
      .on("end", () => resolve())
      .on("error", reject)
      .save(mp3Path);
  });

  // WebMとMP3のURLを返す（例: 静的ファイルサーバーで公開）
  const webmUrl = `http://localhost:3000/audio/${path.basename(webmPath)}`;
  const mp3Url = `http://localhost:3000/audio/${path.basename(mp3Path)}`;

  return { webmUrl, mp3Url };
};

// Next.js APIハンドラ
export default async function handler(req: NextRequest) {
  if (req.method === "POST") {
    try {
      // リクエストの内容を取得
      //@ts-ignore
      const audioBlob = req.body.audio;
      //@ts-ignore
      const duration = req.body.duration;

      // 音声ファイルの保存と変換
      const { webmUrl, mp3Url } = await saveAudioFiles(audioBlob);

      // 変換後のファイルURLを返す
      return NextResponse.json({
        message: "音声ファイルが処理されました",
        webmUrl,
        mp3Url,
      });
    } catch (error) {
      console.error("Error processing audio:", error);
      return NextResponse.json(
        { error: "音声ファイルの処理中にエラーが発生しました" },
        { status: 500 }
      );
    }
  } else {
    // POST以外のメソッドに対してエラーレスポンス
    return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 });
  }
}
