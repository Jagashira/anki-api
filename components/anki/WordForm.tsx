import React, { ChangeEvent, FormEvent } from "react";

interface WordFormProps {
  word: string;
  setWord: (value: string) => void;
  handleAddWord: () => void;
}

const WordForm: React.FC<WordFormProps> = ({
  word,
  setWord,
  handleAddWord,
}) => {
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault(); // ページリロードを防ぐ
    handleAddWord(); // ボタンと同じ関数を呼ぶ
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4">
      <input
        className="p-2 border rounded mb-2 w-full"
        placeholder="例: parse"
        value={word}
        onChange={(e: ChangeEvent<HTMLInputElement>) => setWord(e.target.value)}
      />
    </form>
  );
};

export default WordForm;
