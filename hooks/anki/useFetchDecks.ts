// hooks/useFetchDecks.ts
import { useState, useEffect } from "react";

export const useFetchDecks = () => {
  const [decks, setDecks] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchDecks = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/fetch-decks", {
        method: "POST",
      });
      const data = await response.json();

      if (data.error) {
        setError(data.error);
      } else {
        setDecks(data.decks || []);
      }
    } catch (err) {
      setError("デッキの取得中にエラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDecks();
  }, []);

  return { decks, error, loading };
};
