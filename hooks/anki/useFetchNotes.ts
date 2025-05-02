// hooks/anki/useFetchNotes.ts
import { useState, useCallback } from "react";

export function useFetchNotes() {
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNotes = useCallback(async (deckName: string, tagName?: string) => {
    try {
      setLoading(true);
      setError(null);

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
        setError(data.error || "ノート取得エラー");
      }
    } catch (error) {
      console.error(error);
      setError("ノート取得中にエラーが発生しました");
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    notes,
    loading,
    error,
    fetchNotes,
    setNotes, // 外からノートを更新できるように
  };
}
