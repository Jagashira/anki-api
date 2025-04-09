// app/api/add-note/route.ts

import { NextResponse } from "next/server";

export async function POST() {
  const note = {
    deckName: "English Word",
    modelName: "Basic",
    fields: {
      Front: "表面カード",
      Back: "裏面カード",
    },
    // tags: ['タグを設定できます']
  };

  try {
    const response = await fetch("http://127.0.0.1:8765", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "addNote",
        version: 6,
        params: { note },
      }),
    });

    const data = await response.json();

    if (data.error) {
      return NextResponse.json({ error: data.error }, { status: 500 });
    }

    return NextResponse.json({
      message: "Note added successfully",
      result: data.result,
    });
  } catch (error) {
    console.error("Anki API error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
