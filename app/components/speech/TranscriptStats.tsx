"use client";
import React, { useEffect, useState } from "react";
import { db } from "@/app/lib/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

interface TranscriptData {
  id: string;
  duration: number;
  promptType: string;
  whisperText: string;
  chatGptSummary: string;
  createdAt: { seconds: number };
}

export default function TranscriptStats() {
  const [data, setData] = useState<TranscriptData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const q = query(
          collection(db, "transcripts"),
          orderBy("createdAt", "desc")
        );
        const snapshot = await getDocs(q);
        const docs = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as TranscriptData[];
        setData(docs);
      } catch (error) {
        console.error("Error fetching transcripts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const chartData = data.map((item) => ({
    name: new Date(item.createdAt.seconds * 1000).toLocaleDateString(),
    duration: item.duration,
  }));

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>📊 録音データの統計</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p>読み込み中...</p>
        ) : data.length === 0 ? (
          <p>データがありません。</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="duration" fill="#8884d8" name="音声長 (秒)" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
