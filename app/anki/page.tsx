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

export default function HomePage() {
  const [word, setWord] = useState("");
  const [message, setMessage] = useState("");
  const [result, setResult] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedDeck, setSelectedDeck] = useState<string | null>(null);
  const [img, setimg] = useState<string | null>(null);
  const [audioSrc, setAudioSrc] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleAddWord = () => {
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
    });
  };

  useEffect(() => {
    if (selectedDeck) {
      fetchNotes(selectedDeck, selectedTag || undefined);
    }
  }, [selectedDeck, selectedTag]);

  return (
    <div className="">
      <div className="max-w-md p-6 mx-auto">
        <h1 className="text-4xl font-bold mb-4">英単語簡単に覚える君</h1>

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
        <MessageDisplay message={message} result={result} />
      </div>

      <NotesList notes={notes} loading={notesLoading} error={notesError} />
    </div>
  );
}
