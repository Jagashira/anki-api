import React from "react";

interface MessageDisplayProps {
  message?: string;
  result?: string;
  status?: string;
}

const MessageDisplay: React.FC<MessageDisplayProps> = ({ message, result }) => {
  return (
    <div>
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
};

export default MessageDisplay;
