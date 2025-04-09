import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { word, selectedTag } = await req.json();
  console.log(word, selectedTag);

  if (!word) {
    return NextResponse.json(
      { error: "単語が入力されていません" },
      { status: 400 }
    );
  }

  const openAiKey = process.env.OPENAI_API_KEY;
  if (!openAiKey) {
    return NextResponse.json(
      { error: "OpenAI API キーが設定されていません" },
      { status: 500 }
    );
  }

  const prompt = `次の英単語について、以下の情報を出力してください：
- 意味（日本語）
- 発音記号（アメリカ英語）
- 例文（英語と日本語訳）
- 類義語・関連語（発音記号とその意味）
- 使い方（コラムのようなプラスの知識）

英単語: "${word}"

出力形式：/アメリカ英語の発音記号/
意味（日本語）:
  1. ...
  2. ...

例文:
...

類義語・関連語:
...

使い方:
💡 ...`;

  const openAiRes = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${openAiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
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

  // 改行を `<br>` に変換する処理
  const formattedGenerated = generated
    .replace(/（/g, "(")
    .replace(/）/g, ")")
    .replace(/\n+/g, "<br>") // 改行を `<br>` に置き換え
    .replace(/([^\n]+)(\n)?/g, "$1<br>"); // 改行を `<br>` に置き換え

  const ankiRes = await fetch("http://127.0.0.1:8765", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "addNote",
      version: 6,
      params: {
        note: {
          deckName: `English Word`,
          modelName: "Basic",
          fields: {
            Front: `${word}`,
            Back: formattedGenerated, // `<br>` で改行を反映
          },
          tags: [`${selectedTag}`],
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
  });
}
