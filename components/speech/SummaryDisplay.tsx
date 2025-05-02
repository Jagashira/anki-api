// components/SummaryDisplay.tsx
"use client";
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import ReactMarkdown from "react-markdown";

interface SummaryDisplayProps {
  summary: string | null;
  transcript: string | null;
  isMarkdown: boolean;
}

export const SummaryDisplay = ({
  summary,
  transcript,
  isMarkdown,
}: SummaryDisplayProps) => {
  return (
    <>
      {summary && (
        <Card>
          <CardHeader>
            <CardTitle>📝 要約結果</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] overflow-y-auto">
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
      )}

      {transcript && (
        <Accordion type="single" collapsible className="w-full mt-4">
          <AccordionItem value="transcript">
            <AccordionTrigger>📄 文字起こしを見る</AccordionTrigger>
            <AccordionContent>
              <div className="bg-gray-50 p-4 rounded-md text-sm whitespace-pre-wrap max-h-96 overflow-y-auto">
                {transcript}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}
    </>
  );
};
