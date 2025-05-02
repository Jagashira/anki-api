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
import NotesList from "@/components/anki/NotesList";

export default function HomePage() {
  const [word, setWord] = useState("");
  const [message, setMessage] = useState("");
  const [result, setResult] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedDeck, setSelectedDeck] = useState<string | null>(null);
  const [img, setimg] = useState<string | null>(null);
  const [audioSrc, setAudioSrc] = useState<string | null>(null);
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
        setMessage("🥰 " + data.message);
        setResult(data.content);
        setimg(`data:image/jpeg;base64,${data.image?.base64}`);
        setWord("");

        // 重複ノートがあれば先頭に追加
        if (data.duplicateNote) {
          setNotes((prev) => [
            data.duplicateNote,
            ...prev.filter((n) => n.noteId !== data.duplicateNote.noteId),
          ]);
          setMessage("🫥 " + data.message);
        }
        // else {
        //   // 新しいノートの取得や更新があるなら、ここで再フェッチしてもOK
        //   fetchNotes(selectedDeck!, selectedTag || undefined);
        // }
      } else {
        setMessage("😡 " + data.error);
        setResult("");
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
      <NotesList notes={notes} loading={notesLoading} error={notesError} />
    </div>
  );
}
