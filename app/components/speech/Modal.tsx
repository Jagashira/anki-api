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
import { saveAs } from "file-saver";
import jsPDF from "jspdf";

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: string;
};

const downloadCSV = (content: string) => {
  const csvContent = `text\n"${content}"`; // CSV形式で内容をエクスポート
  const blob = new Blob([csvContent], { type: "text/csv" });
  saveAs(blob, "transcript.csv");
};

const downloadPDF = (content: string) => {
  const doc = new jsPDF();
  doc.text(content, 10, 10); // PDFにテキストを挿入
  doc.save("transcript.pdf");
};

const downloadMarkdown = (content: string) => {
  const markdownContent = `# Transcript\n\n${content}`; // Markdown形式に変換
  const blob = new Blob([markdownContent], { type: "text/markdown" });
  saveAs(blob, "transcript.md");
};

export const Modal = ({ isOpen, onClose, title, content }: ModalProps) => {
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
          <div className="text-gray-600 mt-2">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        </DialogDescription>

        {/* ダウンロードボタン */}
        <div className="mt-4 space-x-4">
          <button
            className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
            onClick={() => downloadCSV(content)}
          >
            CSVとしてダウンロード
          </button>
          <button
            className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
            onClick={() => downloadPDF(content)}
          >
            PDFとしてダウンロード
          </button>
          <button
            className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
            onClick={() => downloadMarkdown(content)}
          >
            Markdownとしてダウンロード
          </button>
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
