import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { TranscriptPDF } from "@/app/api/components/TranscriptPDF";

export async function POST(req: Request) {
  const { content, date, isMarkdown } = await req.json();

  const pdfBuffer = await renderToBuffer(
    <TranscriptPDF content={content} date={date} isMarkdown={isMarkdown} />
  );

  return new NextResponse(pdfBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": "attachment; filename=transcript.pdf",
    },
  });
}
