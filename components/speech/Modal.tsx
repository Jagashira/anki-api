// components/speech/Modal.tsx
"use client";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import ReactMarkdown from "react-markdown";
import { PromptType } from "./PromptSelector";
import dynamic from "next/dynamic";
import DownloadButton from "./DownloadButton";

// PDFDownloadLinkの動的インポート
const PDFDownloadLink = dynamic(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFDownloadLink),
  { ssr: false }
) as React.ComponentType<any>; // 型アサーションを追加

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: string;
  date: string;
  isMarkdown: PromptType;
};

export const Modal = ({
  isOpen,
  onClose,
  title,
  content,
  date,
  isMarkdown,
}: ModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogTrigger asChild>
        <div />
      </DialogTrigger>
      <DialogContent className="bg-white p-6 rounded-lg shadow-lg max-w-3xl mx-auto">
        <DialogTitle className="text-xl font-bold text-gray-800">
          {title}
        </DialogTitle>
        <DialogDescription asChild>
          <div className="text-gray-600 mt-2 max-h-[60vh] overflow-y-auto whitespace-pre-wrap">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        </DialogDescription>

        {/* ✅ PDFダウンロードリンク */}
        <div>
          {/* 他のコンテンツ */}
          <DownloadButton
            content={content}
            date={date}
            isMarkdown={isMarkdown === "markdown"}
          />
        </div>

        <DialogClose
          className="mt-4 inline-block bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
          onClick={onClose}
        >
          閉じる
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
};
