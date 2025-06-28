import { z } from "zod";

// 意味の定義
const MeaningSchema = z.object({
  partOfSpeech: z.string().describe("品詞 (例: 名詞, 動詞)"),
  definition: z.string().describe("その品詞での意味（日本語）"),
});

// 例文の定義
const ExampleSchema = z.object({
  english: z.string().describe("英単語を使った英語の例文"),
  japanese: z.string().describe("例文の日本語訳"),
});

// 類義語の定義
const SynonymSchema = z.object({
  word: z.string().describe("類義語・関連語の単語"),
  pronunciation: z.string().optional().describe("その単語の発音記号"),
  meaning: z.string().describe("その単語の簡単な意味"),
});

// これら全てをまとめた最終的なスキーマ
export const WordInfoSchema = z.object({
  pronunciation: z.string().describe("発音記号（アメリカ英語）"),
  meanings: z.array(MeaningSchema).describe("意味のリスト"),
  examples: z.array(ExampleSchema).describe("例文のリスト"),
  synonyms: z.array(SynonymSchema).describe("類義語・関連語のリスト"),
  usageNotes: z
    .string()
    .describe("その単語の使い方やニュアンスに関するコラム的な知識"),
});

// ZodスキーマからTypeScriptの型を生成
export type WordInfo = z.infer<typeof WordInfoSchema>;
