"use client";

import { useEffect, useState } from "react";
import { db } from "@/app/lib/firebase"; // Firestoreのインポート
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { TranscriptCard } from "./TranscriptCard";

type Transcript = {
  chatGptSummary: string;
  createdAt: { seconds: number };
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
    <div className="w-full overflow-x-auto">
      <div className="flex gap-x-4 p-4 min-w-max">
        {transcripts.map((item, index) => (
          <TranscriptCard key={index} item={item} />
        ))}
      </div>
    </div>
  );
};
