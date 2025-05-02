// hooks/useFetchTags.ts
import { settings } from "firebase/analytics";
import { useState, useEffect } from "react";

export const useFetchTags = () => {
  const [tags, setTags] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchTags = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/fetch-tags", {
        method: "POST",
      });
      const data = await response.json();

      if (data.error) {
        setError(data.error);
      } else {
        setTags(data.tags || []);
      }
    } catch (err) {
      setError("デッキの取得中にエラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  return { tags, error, loading };
};
