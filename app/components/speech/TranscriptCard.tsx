// components/TranscriptCard.tsx
"use client";
import { useState } from "react";
import { Modal } from "./Modal"; // モーダルのインポート
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Transcript } from "./TranscriptList";

export const TranscriptCard = ({ item }: { item: Transcript }) => {
  const [isModalOpen, setIsModalOpen] = useState(false); // モーダルの開閉状態

  const formattedDate = new Date(
    item.createdAt.seconds * 1000
  ).toLocaleDateString();

  return (
    <div>
      <Card className="w-80">
        <CardHeader>
          <CardTitle className="text-xl">要約</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-600">{formattedDate}</div>
          <div className="text-gray-800 mt-2">
            {`${item.chatGptSummary.substring(0, 100)}...`}
          </div>

          <button
            className="text-blue-500 mt-2 ml-4"
            onClick={() => setIsModalOpen(true)} // モーダルを開く
          >
            詳細を見る
          </button>
        </CardContent>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)} // モーダルを閉じる
        title="要約詳細"
        content={item.chatGptSummary} // 詳細内容を渡す
        date={formattedDate}
        isMarkdown={item.promptType}
      />
    </div>
  );
};
