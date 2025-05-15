// components/DownloadButton.tsx

import React from "react";

interface DownloadButtonProps {
  content: string;
  date: string;
  isMarkdown: boolean;
}

const DownloadButton: React.FC<DownloadButtonProps> = ({
  content,
  date,
  isMarkdown,
}) => {
  const handleDownload = async () => {
    const response = await fetch("/api/pdf", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content,
        date,
        isMarkdown,
      }),
    });

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "transcript.pdf";
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="mt-4">
      <button
        onClick={handleDownload}
        className="inline-block bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700"
      >
        PDFとしてダウンロード
      </button>
    </div>
  );
};

export default DownloadButton;
