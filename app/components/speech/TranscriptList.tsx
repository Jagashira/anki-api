"use client";
import { useEffect, useState } from "react";
import { db } from "@/app/lib/firebase"; // Firestoreのインポート
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { TranscriptCard } from "./TranscriptCard";
import { PromptType } from "./PromptSelector";

export type Transcript = {
  chatGptSummary: string;
  createdAt: { seconds: number };
  promptType: PromptType;
};

export const TranscriptList = () => {
  const [transcripts, setTranscripts] = useState<Transcript[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const q = query(
          collection(db, "transcripts"),
          orderBy("createdAt", "desc")
        );
        const querySnapshot = await getDocs(q);
        const data: Transcript[] = querySnapshot.docs.map((doc) => {
          const docData = doc.data();
          return {
            chatGptSummary: docData.chatGptSummary || "", // chatGptSummaryがあるかチェックしてから追加
            createdAt: docData.createdAt,
            promptType: docData.promptType,
          };
        });
        setTranscripts(data);
      } catch (error) {
        console.error("Error fetching transcripts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div>
        <h2 className="text-2xl">Transcription 一覧</h2>
      </div>

      <div className="w-full overflow-x-auto">
        <div className="flex gap-x-4 p-4 min-w-max">
          {transcripts.map((item, index) => (
            <TranscriptCard key={index} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
};
