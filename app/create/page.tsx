"use client";
import { useEffect, useState } from "react";
import imageContainer from "@/app/lib/imageContainer";

export default function HomePage() {
  const [word, setWord] = useState("");
  const [message, setMessage] = useState("");
  const [result, setResult] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [selectedTag, setSelectedTag] = useState<string>("");
  const [decks, setDecks] = useState<string[]>([]);
  const [selectedDeck, setSelectedDeck] = useState<string>();
  const [img, setimg] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  (""); // 選択されたデッキ

  // サーバーサイドでタグを取得する関数
  const fetchTags = async () => {
    try {
      const response = await fetch("/api/fetch-tags", {
        method: "POST", // POSTメソッドを使用
      });
      const data = await response.json();

      // レスポンス内容を確認
      console.log("取得したデータ:", data);

      if (data.error) {
        console.error("タグの取得に失敗:", data.error);
      } else {
        setTags(data.tags); // 取得したタグをセット
      }
    } catch (error) {
      console.error("タグの取得に失敗:", error);
    }
  };
  const fetchDecks = async () => {
    try {
      const response = await fetch("/api/fetch-decks", {
        method: "POST",
      });
      const data = await response.json();

      if (data.error) {
        console.error("デッキ名の取得に失敗:", data.error);
      } else {
        setDecks(data.decks); // 取得したデッキ名をセット
      }
    } catch (error) {
      console.error("デッキ名の取得に失敗:", error);
    }
  };

  const handleTagChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedTag(e.target.value);
  };

  const handleDeckChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDeck(e.target.value);
    console.log("test", e.target.value);
  };

  const handleAddWord = async () => {
    const res = await fetch("/api/add-note", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ word, selectedTag, selectedDeck }),
    });
    console.log(selectedTag);

    const data = await res.json();

    if (res.ok) {
      setMessage("✅ " + data.message);
      setResult(data.content);
      setimg(`data:image/jpeg;base64,${data.image.base64}`);
      setStatus("Ankiに追加されました！");
    } else {
      setMessage("❌ " + data.error);
      setResult("");
      setStatus(`エラー: ${data.error}`);
    }
  };
  useEffect(() => {
    fetchTags(); // タグを取得
    fetchDecks(); // デッキ名を取得
  }, []);

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-4xl font-bold mb-4 ">英単語簡単に覚える君</h1>

      <div>
        <form className="max-w-sm mx-auto">
          <select
            id="decks"
            className="block py-2.5 px-0 w-full text-sm text-gray-500 bg-transparent border-0 border-b-2 border-gray-200 appearance-none dark:text-gray-400 dark:border-gray-700 focus:outline-none focus:ring-0 focus:border-gray-200 peer"
            value={selectedDeck}
            onChange={handleDeckChange}
          >
            <option value="">~Choose Your Deck~</option>
            {decks.map((decks, index) => (
              <option key={index} value={decks}>
                {decks}
              </option>
            ))}
          </select>
        </form>
        <form className="max-w-sm mx-auto">
          <select
            id="tags"
            className="block py-2.5 px-0 w-full text-sm text-gray-500 bg-transparent border-0 border-b-2 border-gray-200 appearance-none dark:text-gray-400 dark:border-gray-700 focus:outline-none focus:ring-0 focus:border-gray-200 peer"
            value={selectedTag}
            onChange={handleTagChange}
          >
            <option value="">~Choose Your Tag~</option>
            {tags.map((tag, index) => (
              <option key={index} value={tag}>
                {tag}
              </option>
            ))}
          </select>
        </form>
      </div>

      <div className="">
        <input
          className=" p-2 border rounded mb-2"
          placeholder="例: parse"
          value={word}
          onChange={(e) => setWord(e.target.value)}
        />
        <div className=""></div>
      </div>

      <button
        onClick={handleAddWord}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
      >
        ChatGPTで生成してAnkiに追加
      </button>
      {message && <p className="mt-4">{message}</p>}
      {result && (
        <div className="mt-4 p-3 bg-gray-100 rounded">
          <strong>生成された内容:</strong>
          <pre className="whitespace-pre-wrap">
            <div dangerouslySetInnerHTML={{ __html: result }} />
          </pre>
        </div>
      )}
      <p>{status}</p>

      {img && (
        <div>
          <h3 className="font-semibold mt-4">取得した画像：</h3>
          {imageContainer({ img, word })}
        </div>
      )}
    </div>
  );
}
