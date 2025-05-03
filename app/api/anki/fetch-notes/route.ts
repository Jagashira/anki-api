// app/api/fetch-notes/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { deckName, tagName } = await req.json();

    if (!deckName) {
      return NextResponse.json(
        { error: "デッキ名が必要です" },
        { status: 400 }
      );
    }

    // 検索クエリを作成
    let query = `deck:"${deckName}"`;
    if (tagName) {
      query += ` tag:"${tagName}"`;
    }

    // findNotesでnote id一覧を取得
    const findNotesResponse = await fetch("http://127.0.0.1:8765", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "findNotes",
        version: 6,
        params: {
          query,
        },
      }),
    });

    const findNotesData = await findNotesResponse.json();

    if (findNotesData.error) {
      console.error("AnkiConnect findNotesエラー:", findNotesData.error);
      return NextResponse.json({ error: findNotesData.error }, { status: 500 });
    }

    const noteIds: number[] = findNotesData.result;

    if (noteIds.length === 0) {
      return NextResponse.json({ notes: [] });
    }

    // notesInfoでnoteの詳細情報を取得
    const notesInfoResponse = await fetch("http://127.0.0.1:8765", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "notesInfo",
        version: 6,
        params: {
          notes: noteIds,
        },
      }),
    });

    const notesInfoData = await notesInfoResponse.json();

    if (notesInfoData.error) {
      console.error("AnkiConnect notesInfoエラー:", notesInfoData.error);
      return NextResponse.json({ error: notesInfoData.error }, { status: 500 });
    }

    console.log("ノートの取得に成功しました");
    return NextResponse.json({ notes: notesInfoData.result });
  } catch (error) {
    console.error("ノート取得エラー:", error);
    return NextResponse.json(
      { error: "ノート取得中にエラーが発生しました" },
      { status: 500 }
    );
  }
}
