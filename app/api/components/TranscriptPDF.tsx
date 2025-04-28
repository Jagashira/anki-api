import { Document, Page, Text, StyleSheet, Font } from "@react-pdf/renderer";
import markdownToTxt from "markdown-to-txt";

// フォント登録はここでも行う
Font.register({
  family: "Noto Sans JP",
  fonts: [
    { src: "/fonts/NotoSansJP/NotoSansJP-Regular.ttf", fontWeight: "normal" },
    { src: "/fonts/NotoSansJP/NotoSansJP-Bold.ttf", fontWeight: "bold" },
  ],
});

const styles = StyleSheet.create({
  page: {
    padding: 30,
    backgroundColor: "#fff",
    fontFamily: "Noto Sans JP",
  },
  date: {
    position: "absolute",
    top: 10,
    right: 10,
    fontSize: 10,
    color: "#555",
  },
  content: {
    fontSize: 12,
    lineHeight: 1.6,
    whiteSpace: "pre-wrap",
  },
  title: {
    fontSize: 18,
    marginBottom: 10,
    fontWeight: "bold",
  },
});

export const TranscriptPDF = ({
  content,
  date,
  isMarkdown,
}: {
  content: string;
  date: string;
  isMarkdown: boolean;
}) => {
  const plainText = isMarkdown ? markdownToTxt(content) : content;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.date}>{date}</Text>
        <Text style={styles.title}>要約内容</Text>
        <Text style={styles.content}>{plainText}</Text>
      </Page>
    </Document>
  );
};
