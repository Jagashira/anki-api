const ANKI_CONNECT_URL = "http://127.0.0.1:8765";

type PendingWord = {
  id: string;
  word: string;
  selectedDeck: string;
  selectedTag: string;
  formattedContent: string;
};

const useSyncToAnki = () => {
  const syncWordToAnki = async (wordId: string) => {
    try {
      const res = await fetch(`/api/anki/sync-to-anki`, {
        method: "POST",
        body: JSON.stringify({ wordId }),
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();
      console.log("同期結果:", data);

      if (!res.ok) {
        throw new Error(data.error || "同期に失敗しました");
      }

      return { message: data.message };
    } catch (err: any) {
      return { message: err.message };
    }
  };

  const syncAllWordsToAnki = async (words: any[]) => {
    for (const word of words) {
      await syncWordToAnki(word.id);
    }
    return { message: "すべての単語を同期しました" };
  };

  return { syncWordToAnki, syncAllWordsToAnki };
};

export default useSyncToAnki;
