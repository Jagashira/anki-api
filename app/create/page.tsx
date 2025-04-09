"use client";
import { useEffect } from "react";

import { useState } from "react";

export default function HomePage() {
  const [word, setWord] = useState("");
  const [message, setMessage] = useState("");
  const [result, setResult] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [selectedTag, setSelectedTag] = useState<string>("");

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

  useEffect(() => {
    fetchTags(); // コンポーネントがマウントされたときにタグを取得
  }, []);

  const handleTagChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedTag(e.target.value);
  };

  const handleAddWord = async () => {
    const res = await fetch("/api/add-note", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ word, selectedTag }),
    });
    console.log(selectedTag);

    const data = await res.json();

    if (res.ok) {
      setMessage("✅ " + data.message);
      setResult(data.content);
    } else {
      setMessage("❌ " + data.error);
      setResult("");
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">
        英単語 → ChatGPT解説 → Anki追加
      </h1>
      <div className="flex">
        <input
          className="w-[70%] p-2 border rounded mb-2"
          placeholder="例: parse"
          value={word}
          onChange={(e) => setWord(e.target.value)}
        />
        <div className="w-[30%]">
          <select id="tags" value={selectedTag} onChange={handleTagChange}>
            <option value="">タグを選択</option>
            {tags.map((tag, index) => (
              <option key={index} value={tag}>
                {tag}
              </option>
            ))}
          </select>
        </div>
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
    </div>
  );
}
