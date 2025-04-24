// components/TranscriptPDF.tsx
import { Document, Page, Text, StyleSheet, Font } from "@react-pdf/renderer";

Font.register({
  family: "Noto Sans JP",
  fonts: [
    {
      src: "/fonts/NotoSansJP/NotoSansJP-Regular.ttf",
      fontWeight: "normal",
    },
    {
      src: "/fonts/NotoSansJP/NotoSansJP-Bold.ttf",
      fontWeight: "bold",
    },
  ],
});

// ✅ フォント登録

const styles = StyleSheet.create({
  page: {
    backgroundColor: "#f0f0f0",
    padding: 30,
  },
  title: {
    fontFamily: "Noto Sans JP",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  text: {
    fontFamily: "Noto Sans JP",
    fontSize: 12,
    fontWeight: "normal",
  },
  date: {
    position: "absolute", // 絶対位置
    top: 10, // 上から10px
    right: 10, // 右から10px
    fontFamily: "Noto Sans JP",
    fontSize: 12,
    fontWeight: "normal",
    color: "#555",
  },
});

export const TranscriptPDF = ({
  content,
  date,
}: {
  content: string;
  date: string;
}) => (
  <Document>
    <Page style={styles.page}>
      <Text style={styles.date}>{date}</Text>
      <Text style={styles.title}>要約内容</Text>
      <Text style={styles.text}>{content}</Text>
    </Page>
  </Document>
);
