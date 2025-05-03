"use client";
import { useEffect, useState } from "react";
import { useFetchDecks } from "@/hooks/anki/useFetchDecks";
import { useFetchTags } from "@/hooks/anki/useFetchTags";
import { useFetchNotes } from "@/hooks/anki/useFetchNotes";
import DeckSelect from "@/components/anki/DeckSelect";
import TagSelect from "@/components/anki/TagSelect";
import AddButton from "@/components/anki/AddButton";
import WordForm from "@/components/anki/WordForm";
import MessageDisplay from "@/components/anki/MessageDisplay";
import NotesList from "@/components/anki/NotesList";
import { addWord } from "@/hooks/anki/useAddWord";
import { prompts } from "@/lib/anki/definitions";
import { addWordToFirebase } from "@/hooks/anki/useAddWordToFirebase";
import { checkAnkiConnection } from "@/lib/anki/checkAnkiConnextion";

export default function HomePage() {
  const [word, setWord] = useState("");
  const [message, setMessage] = useState("");
  const [result, setResult] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedDeck, setSelectedDeck] = useState<string | null>(null);
  const [img, setimg] = useState<string | null>(null);
  const [audioSrc, setAudioSrc] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [language, setLanguage] = useState<"english" | "japanese">("english");
  const [isAnkiConnected, setIsAnkiConnected] = useState(false);

  const { decks, error: decksError, loading: decksLoading } = useFetchDecks();
  const { tags, error: tagsError, loading: tagsLoading } = useFetchTags();

  const {
    notes,
    loading: notesLoading,
    error: notesError,
    fetchNotes,
    setNotes,
  } = useFetchNotes();

  const handleTagChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedTag(e.target.value);
  };

  const handleDeckChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDeck(e.target.value);
    console.log("test", e.target.value);
  };

  const handleAddWord = async () => {
    addWord({
      word,
      selectedTag,
      selectedDeck,
      setIsSubmitting,
      setMessage,
      setResult,
      setimg,
      setAudioSrc,
      setWord,
      setNotes,
      language,
      isAnkiConnected,
    });
  };

  useEffect(() => {
    const checkAnkiConnectionAndFetchNotes = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8765", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "version", version: 6 }),
        });
        const data = await res.json();

        if (data.result) {
          setIsAnkiConnected(true);

          if (selectedDeck) {
            fetchNotes(selectedDeck, selectedTag || undefined);
          }
        } else {
          setIsAnkiConnected(false);
        }
      } catch (err) {
        setIsAnkiConnected(false);
      }
    };

    checkAnkiConnectionAndFetchNotes();
  }, [selectedDeck, selectedTag]);

  return (
    <div className="">
      <div className="max-w-md p-6 mx-auto">
        <h1 className="text-4xl font-bold mb-4">{prompts[language].title}</h1>
        <div>
          {/*ankiの接続状態を表示*/}
          {isAnkiConnected ? (
            <p className="text-green-500">Ankiに接続中...</p>
          ) : (
            <p className="text-red-500">Ankiに接続できません</p>
          )}
        </div>
        <div className="mb-4">
          <label className="mr-2 font-semibold">言語モード:</label>
          <select
            value={language}
            onChange={(e) =>
              setLanguage(e.target.value as "english" | "japanese")
            }
            className="border rounded px-2 py-1"
          >
            <option value="english">英単語</option>
            <option value="japanese">日本語</option>
          </select>
        </div>

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
        <AddButton
          isSubmitting={isSubmitting}
          handleAddWord={handleAddWord}
          isAnkiConnected={isAnkiConnected}
        />
        <MessageDisplay message={message} result={result} />
      </div>

      <NotesList notes={notes} loading={notesLoading} error={notesError} />
    </div>
  );
}
