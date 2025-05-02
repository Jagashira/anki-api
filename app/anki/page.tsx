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

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-4xl font-bold mb-4 ">英単語簡単に覚える君</h1>

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
  );
}
