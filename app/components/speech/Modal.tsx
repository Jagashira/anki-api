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

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: string;
};

export const Modal = ({ isOpen, onClose, title, content }: ModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogTrigger asChild>
        {/* 何も表示しないトリガー */}
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
