import React from "react";

interface AddButtonProps {
  isSubmitting: boolean;
  handleAddWord: () => void;
}

const AddButton: React.FC<AddButtonProps> = ({
  isSubmitting,
  handleAddWord,
}) => {
  return (
    <button
      onClick={handleAddWord}
      disabled={isSubmitting}
      className={`bg-blue-600 text-white px-4 py-2 rounded w-full 
        ${
          isSubmitting ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-700"
        }`}
    >
      {isSubmitting ? "追加中..." : "Ankiに追加"}
    </button>
  );
};

export default AddButton;
