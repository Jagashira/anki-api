"use client";
import { useEffect, useState } from "react";
import { useFetchDecks } from "@/hooks/anki/useFetchDecks";
import { useFetchTags } from "@/hooks/anki/useFetchTags";
import DeckSelect from "@/components/anki/DeckSelect";
import { Tag } from "lucide-react";
import TagSelect from "@/components/anki/TagSelect";
import AddButton from "@/components/anki/AddButton";
import WordForm from "@/components/anki/WordForm";
import MessageDisplay from "@/components/anki/MessageDisplay";

export default function HomePage() {
  const [word, setWord] = useState("");
  const [message, setMessage] = useState("");
  const [result, setResult] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedDeck, setSelectedDeck] = useState<string | null>(null);
  const [img, setimg] = useState<string | null>(null);
  const [audioSrc, setAudioSrc] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notes, setNotes] = useState<any[]>([]);
  const [notesLoading, setNotesLoading] = useState(false);
  const [notesError, setNotesError] = useState<string | null>(null);

  (""); // 選択されたデッキ

  const { decks, error: decksError, loading: decksLoading } = useFetchDecks();
  const { tags, error: tagsError, loading: tagsLoading } = useFetchTags();

  const handleTagChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedTag(e.target.value);
  };

  const handleDeckChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDeck(e.target.value);
    console.log("test", e.target.value);
  };

  const handleAddWord = async () => {
    if (isSubmitting) return; // 二重送信防止（保険）

    setIsSubmitting(true); // 🔒ボタン無効化

    try {
      const res = await fetch("/api/add-note", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ word, selectedTag, selectedDeck }),
      });

      const data = await res.json();

      if (data.audio?.base64) {
        setAudioSrc(`data:audio/mp3;base64,${data.audio.base64}`);
      }

      if (res.ok) {
        setMessage("✅ " + data.message);
        setResult(data.content);
        setimg(`data:image/jpeg;base64,${data.image.base64}`);
        setStatus("Ankiに追加されました！");
        setWord("");
      } else {
        setMessage("❌ " + data.error);
        setResult("");
        setStatus(`エラー: ${data.error}`);
      }
    } catch (error) {
      setMessage("❌ エラーが発生しました");
    } finally {
      setIsSubmitting(false); // 🔓ボタン再有効化
    }
  };
  const fetchNotes = async (deckName: string, tagName?: string) => {
    try {
      setNotesLoading(true);
      setNotesError(null);

      const res = await fetch("/api/fetch-notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ deckName, tagName }),
      });

      const data = await res.json();

      if (res.ok) {
        setNotes(data.notes || []);
      } else {
        setNotesError(data.error || "ノート取得エラー");
      }
    } catch (error) {
      console.error(error);
      setNotesError("ノート取得中にエラーが発生しました");
    } finally {
      setNotesLoading(false);
    }
  };
  useEffect(() => {
    if (selectedDeck) {
      fetchNotes(selectedDeck, selectedTag || undefined);
    }
  }, [selectedDeck, selectedTag]);

  return (
    <div className="">
      <div className="max-w-md p-6  mx-auto">
        <h1 className=" text-4xl font-bold mb-4 ">英単語簡単に覚える君</h1>

        <div>
          <DeckSelect
            decks={decks}
            selectedDeck={selectedDeck}
            decksLoading={decksLoading}
            decksError={decksError}
            handleDeckChange={handleDeckChange}
          />

          <TagSelect
            tags={tags}
            selectedtag={selectedTag}
            tagsLoading={tagsLoading}
            tagsError={tagsError}
            handletagChange={handleTagChange}
          />
        </div>
        <WordForm word={word} setWord={setWord} handleAddWord={handleAddWord} />

        <AddButton isSubmitting={isSubmitting} handleAddWord={handleAddWord} />

        <MessageDisplay message={message} result={result} status={status} />
      </div>
      <div className="max-w-4xl p-6  mx-auto">
        {notesLoading && <p>ノート読み込み中...</p>}
        {notesError && <p className="text-red-500">{notesError}</p>}

        {notes.length > 0 && (
          <div className="mt-4">
            <h2 className="text-lg font-bold mb-2 text-center">
              取得したノート一覧
            </h2>

            {/* 横スクロールにする親要素 */}
            <div className="flex space-x-4 overflow-x-auto pb-4">
              {notes.map((note) => (
                <div
                  key={note.noteId}
                  className="min-w-[300px] p-4 border rounded bg-white shadow break-words overflow-hidden"
                >
                  <div className="mb-2">
                    <strong className="text-blue-700">Front:</strong>{" "}
                    {note.fields.Front.value}
                  </div>

                  <div className="mb-2">
                    <strong className="text-blue-700">Back:</strong>
                    <div
                      className="mt-1 text-gray-700 whitespace-pre-wrap break-words"
                      dangerouslySetInnerHTML={{
                        __html: note.fields.Back.value,
                      }}
                    />
                  </div>

                  {note.tags && note.tags.length > 0 && (
                    <div className="mt-2 text-sm text-gray-500">
                      <strong>Tags:</strong> {note.tags.join(", ")}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
