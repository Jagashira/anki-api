// hooks/anki/useFetchTags.ts
"use client";
import { useState, useEffect } from "react";

export const useFetchTags = () => {
  const [tags, setTags] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchTags = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/anki/fetch-tags", {
        method: "POST",
      });

      const data = await response.json();
      console.log("Tags data:", data.tags); // デバッグ用

      if (data.error) {
        setError(data.error);
      } else {
        setTags(data.tags || []);
      }
    } catch (err) {
      setError("Ankiが起動していないか、AnkiConnectにアクセスできません");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  return { tags, error, loading };
};
