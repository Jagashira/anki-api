"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import ReactMarkdown from "react-markdown";

interface SummaryResultCardProps {
  summary: string;
  isMarkdown: boolean;
}

export const SummaryResultCard = ({
  summary,
  isMarkdown,
}: SummaryResultCardProps) => {
  if (!summary) return null;

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="text-xl md:text-2xl">📝 要約結果</CardTitle>
      </CardHeader>
      <CardContent>
        {isMarkdown ? (
          <div className="prose prose-neutral max-w-none">
            <ReactMarkdown>{summary}</ReactMarkdown>
          </div>
        ) : (
          <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
            {summary}
          </p>
        )}
      </CardContent>
    </Card>
  );
};
