import React, { useEffect, useState } from "react";

interface AddButtonProps {
  isSubmitting: boolean;
  handleAddWord: () => void;
  isAnkiConnected: boolean;
}

const AddButton: React.FC<AddButtonProps> = ({
  isSubmitting,
  handleAddWord,
  isAnkiConnected,
}) => {
  const handleClick = () => {
    handleAddWord();
  };

  return (
    <button
      onClick={handleClick}
      disabled={isSubmitting || isAnkiConnected === null}
      className={`bg-blue-600 text-white px-4 py-2 rounded w-full 
        ${
          isSubmitting || isAnkiConnected === null
            ? "opacity-50 cursor-not-allowed"
            : "hover:bg-blue-700"
        }`}
    >
      {isSubmitting
        ? "追加中..."
        : isAnkiConnected
        ? "Ankiに追加"
        : "Firebaseに追加"}
    </button>
  );
};

export default AddButton;
