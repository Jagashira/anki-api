import { BsMicFill, BsStopFill } from "react-icons/bs";

export default function RecorderButton({
  recording,
  onClick,
}: {
  recording: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-24 h-24 rounded-full flex items-center justify-center shadow-lg transition duration-300
        ${
          recording
            ? "bg-red-600 animate-pulse"
            : "bg-green-600 hover:bg-green-700"
        }`}
    >
      {recording ? (
        <BsStopFill className="text-white text-3xl" />
      ) : (
        <BsMicFill className="text-white text-3xl" />
      )}
    </button>
  );
}
