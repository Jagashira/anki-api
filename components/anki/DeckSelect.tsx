import React from "react";

interface DeckSelectProps {
  decks: string[];
  selectedDeck: string | null; // selectedDeckをstring | null型に変更
  decksLoading: boolean;
  decksError: string | null;
  handleDeckChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

const DeckSelect: React.FC<DeckSelectProps> = ({
  decks,
  selectedDeck,
  decksLoading,
  decksError,
  handleDeckChange,
}) => {
  return (
    <form className="max-w-sm mx-auto">
      <select
        id="decks"
        className="block py-2.5 px-0 w-full text-sm text-gray-500 bg-transparent border-0 border-b-2 border-gray-200 appearance-none dark:text-gray-400 dark:border-gray-700 focus:outline-none focus:ring-0 focus:border-gray-200 peer"
        value={selectedDeck ?? ""} // selectedDeckがnullの場合、空文字を使用
        onChange={handleDeckChange}
      >
        <option value="">~Choose Your Deck~</option>

        {decksLoading ? (
          <option disabled>読み込み中...</option>
        ) : decksError ? (
          <>
            <option disabled>エラー: {decksError}</option>
            <option key="english" value={"English"}>
              English Word
            </option>
            <option key="japanese" value={"Japanese"}>
              Japanese Word
            </option>
          </>
        ) : (
          decks.map((deck, index) => (
            <option key={index} value={deck}>
              {deck}
            </option>
          ))
        )}
      </select>
    </form>
  );
};

export default DeckSelect;
