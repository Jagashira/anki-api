import { getImageUrl } from "@/utils/getImageUrl";
import getAudioFromGoogle from "@/utils/getAudio";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { word, selectedDeck } = await req.json();

  if (!word || !selectedDeck) {
    return NextResponse.json(
      { error: "word または deck が不足しています" },
      { status: 400 }
    );
  }

  // 🖼️ 画像の取得
  const imageUrl = await getImageUrl(word);
  if (!imageUrl) {
    return NextResponse.json(
      { error: "画像の取得に失敗しました" },
      { status: 500 }
    );
  }

  const imageRes = await fetch(imageUrl);
  const imageBuffer = await imageRes.arrayBuffer();
  const base64Image = Buffer.from(imageBuffer).toString("base64");
  const imageFileName = `${word}_${Date.now()}.jpg`;

  // 🔊 音声の取得（Google TTSなど）
  const audio = await getAudioFromGoogle(word); // 返り値: { base64, fileName }

  return NextResponse.json({
    message: "取得成功",
    image: {
      base64: base64Image,
      fileName: imageFileName,
    },
    audio,
  });
}
