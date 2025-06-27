import { getImageUrl } from "@/utils/getImageUrl";
import getAudioFromGoogle from "@/utils/getAudio";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const apiKey = req.headers.get("X-API-Key");
  if (apiKey !== process.env.X_API_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { word, selectedTag, selectedDeck, prompt } = await req.json(); // 👈 promptを受け取る
  console.log(word, selectedTag, selectedDeck, prompt);

  // ✅ 入力チェック
  if (!word) {
    return NextResponse.json(
      { error: "単語が入力されていません" },
      { status: 400 }
    );
  }

  // ✅ デッキ名チェック
  if (!selectedDeck) {
    return NextResponse.json(
      { error: "デッキ名が選択されていません" },
      { status: 400 }
    );
  }

  //openaiのAPIキーが設定されているか確認
  const openAiKey = process.env.OPENAI_API_KEY;
  if (!openAiKey) {
    return NextResponse.json(
      { error: "OpenAI API キーが設定されていません" },
      { status: 500 }
    );
  }

  // ✅ 重複チェック: 既存ノートがあるか確認
  const checkDuplicate = await fetch("http://127.0.0.1:8765", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "findNotes",
      version: 6,
      params: {
        query: `deck:"${selectedDeck}" Front:"${word}"`,
      },
    }),
  });

  const duplicateData = await checkDuplicate.json();
  const noteIds = duplicateData.result;

  if (noteIds && noteIds.length > 0) {
    const infoRes = await fetch("http://127.0.0.1:8765", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "notesInfo",
        version: 6,
        params: { notes: noteIds },
      }),
    });

    const infoData = await infoRes.json();
    const existingNote = infoData.result[0];

    return NextResponse.json({
      message: "既に同じ単語が登録されています",
      duplicateNote: {
        noteId: existingNote.noteId,
        fields: existingNote.fields,
        tags: existingNote.tags,
      },
    });
  }

  // 🔊 音声と 🖼️ 画像の取得

  let base64Image: string | null = null;
  let fileName: string | null = null;

  const imageUrl = await getImageUrl(word);
  if (imageUrl) {
    try {
      const imageRes = await fetch(imageUrl);
      const buffer = await imageRes.arrayBuffer();
      base64Image = Buffer.from(buffer).toString("base64");
      fileName = `${word}_${Date.now()}.jpg`;

      // AnkiConnect: 画像の保存
      await fetch("http://127.0.0.1:8765", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "storeMediaFile",
          version: 6,
          params: {
            filename: fileName,
            data: base64Image,
          },
        }),
      });
    } catch (error) {
      console.warn("画像の取得または保存に失敗しました:", error);
      base64Image = null;
      fileName = null;
    }
  }
  const audio = await getAudioFromGoogle(word);

  // 🤖 ChatGPTで意味・用法を生成
  const openAiRes = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${openAiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }], // 👈 promptを利用
      temperature: 0.7,
    }),
  });

  const openAiData = await openAiRes.json();
  const generated = openAiData?.choices?.[0]?.message?.content;

  if (!generated) {
    return NextResponse.json(
      { error: "意味の取得に失敗しました" },
      { status: 500 }
    );
  }

  let formattedGenerated = generated
    .replace(/（/g, "(")
    .replace(/）/g, ")")
    .replace(/\n+/g, "<br>")
    .replace(/([^\n]+)(\n)?/g, "$1<br> ");

  if (base64Image && fileName) {
    formattedGenerated += `<br><img src="data:image/jpeg;base64,${base64Image}" alt="${word}"><br>`;
  }
  formattedGenerated += `<br><audio controls><source src="data:audio/mp3;base64,${audio.base64}" type="audio/mp3"></audio>`;

  // 📝 Ankiにノート追加
  const ankiRes = await fetch("http://127.0.0.1:8765", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "addNote",
      version: 6,
      params: {
        note: {
          deckName: selectedDeck,
          modelName: "Basic",
          fields: {
            Front: word,
            Back: formattedGenerated,
          },
          tags: [selectedTag],
        },
      },
    }),
  });

  const ankiData = await ankiRes.json();

  if (ankiData.error) {
    return NextResponse.json({ error: ankiData.error }, { status: 500 });
  }

  return NextResponse.json({
    message: "Ankiに追加しました",
    content: formattedGenerated,
    image: {
      base64: base64Image,
      fileName,
    },
    audio: {
      base64: audio.base64,
      fileName: audio.fileName,
    },
  });
}
