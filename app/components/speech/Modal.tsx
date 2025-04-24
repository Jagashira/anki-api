// components/ui/Modal.tsx
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
import { PDFDownloadLink } from "@react-pdf/renderer";
import { TranscriptPDF } from "./TranscriptPDF"; // 先ほど作ったPDFコンポーネントをインポート

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: string;
  date: string;
};

export const Modal = ({
  isOpen,
  onClose,
  title,
  content,
  date,
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
        <div className="mt-4">
          <PDFDownloadLink
            document={<TranscriptPDF content={content} date={date} />}
            fileName="transcript.pdf"
            className="inline-block bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700"
          >
            {({ loading }) => (loading ? "準備中..." : "PDFとしてダウンロード")}
          </PDFDownloadLink>
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
