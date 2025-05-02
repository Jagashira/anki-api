import React from "react";

interface TagSelectProps {
  tags: string[];
  selectedtag: string | null; // selectedtagをstring | null型に変更
  tagsLoading: boolean;
  tagsError: string | null;
  handletagChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

const TagSelect: React.FC<TagSelectProps> = ({
  tags,
  selectedtag,
  tagsLoading,
  tagsError,
  handletagChange,
}) => {
  return (
    <form className="max-w-sm mx-auto">
      <select
        id="tags"
        className="block py-2.5 px-0 w-full text-sm text-gray-500 bg-transparent border-0 border-b-2 border-gray-200 appearance-none dark:text-gray-400 dark:border-gray-700 focus:outline-none focus:ring-0 focus:border-gray-200 peer"
        value={selectedtag ?? ""} // selectedtagがnullの場合、空文字を使用
        onChange={handletagChange}
      >
        <option value="">~Choose Your tag~</option>

        {tagsLoading ? (
          <option disabled>読み込み中...</option>
        ) : tagsError ? (
          <option disabled>エラー: {tagsError}</option>
        ) : (
          tags.map((tag, index) => (
            <option key={index} value={tag}>
              {tag}
            </option>
          ))
        )}
      </select>
    </form>
  );
};

export default TagSelect;
