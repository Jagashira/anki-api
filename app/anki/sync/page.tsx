"use client";

import { useEffect, useState } from "react";
import useSyncToAnki from "@/hooks/anki/useSyncToAnki";

interface PendingWord {
  id: string;
  word: string;
  selectedTag: string;
  selectedDeck: string;
  explanation: string;
  formattedContent: string;
  createdAt: any;
}

const SyncPage = () => {
  const [pendingWords, setPendingWords] = useState<PendingWord[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncMessage, setSyncMessage] = useState("");

  const { syncWordToAnki, syncAllWordsToAnki } = useSyncToAnki();

  // API経由で未同期単語取得
  const fetchPendingWordsFromAPI = async () => {
    try {
      const res = await fetch("/api/anki/fetch-pending-words");
      const data = await res.json();
      if (res.ok) {
        setPendingWords(data.words);
      } else {
        throw new Error(data.error || "取得に失敗しました");
      }
    } catch (err) {
      console.error("単語取得エラー:", err);
      setSyncMessage("未同期の単語の取得に失敗しました");
    }
  };

  useEffect(() => {
    fetchPendingWordsFromAPI();
  }, []);

  const handleSyncWord = async (wordId: string) => {
    setLoading(true);
    try {
      const result = await syncWordToAnki(wordId);
      setSyncMessage(result.message);
      await fetchPendingWordsFromAPI(); // 同期後に再取得
    } catch {
      setSyncMessage("同期に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  //   const handleSyncAllWords = async () => {
  //     setLoading(true);
  //     try {
  //       const result = await syncAllWordsToAnki(pendingWords);
  //       setSyncMessage(result.message);
  //       await fetchPendingWordsFromAPI();
  //     } catch {
  //       setSyncMessage("一括同期に失敗しました");
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">未同期の単語</h1>

      {loading && <p className="text-blue-600">同期中...</p>}
      {syncMessage && <p className="text-green-600">{syncMessage}</p>}

      {pendingWords.length === 0 ? (
        <p>未同期の単語はありません。</p>
      ) : (
        <>
          {/* <button
            className="bg-blue-600 text-white px-4 py-2 rounded mb-4"
            onClick={handleSyncAllWords}
            disabled={loading}
          >
            すべての単語を同期
          </button> */}
          <ul className="space-y-4">
            {pendingWords.map((word) => (
              <li key={word.id} className="border p-4 rounded shadow-sm">
                <p className="font-medium">{word.word}</p>
                <p className="text-sm text-gray-600">
                  デッキ: {word.selectedDeck} / タグ: {word.selectedTag}
                </p>
                <button
                  className="mt-2 text-sm bg-green-500 text-white px-3 py-1 rounded"
                  onClick={() => handleSyncWord(word.id)}
                  disabled={loading}
                >
                  この単語を同期
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};

export default SyncPage;
