import { TextToSpeechClient, protos } from "@google-cloud/text-to-speech";

type SynthesizeSpeechRequest =
  protos.google.cloud.texttospeech.v1.ISynthesizeSpeechRequest;

interface Props extends SynthesizeSpeechRequest {
  input: {
    text: string; // 入力されたテキスト
  };
  voice: {
    languageCode: string; // 言語コード (例: "en-US")
    ssmlGender: "NEUTRAL" | "MALE" | "FEMALE"; // 声の性別 (中立、男性、女性)
  };
  audioConfig: {
    audioEncoding: "MP3"; // 音声のエンコーディング形式 (MP3)
  };
}

async function getAudioFromGoogle(
  word: string
): Promise<{ base64: string; fileName: string }> {
  const client = new TextToSpeechClient();

  const request: Props = {
    input: { text: word },
    voice: { languageCode: "en-US", ssmlGender: "NEUTRAL" },
    audioConfig: { audioEncoding: "MP3" },
  };

  try {
    const [response] = await client.synthesizeSpeech(request);

    // audioContentが存在しない場合、エラーを投げる
    if (!response.audioContent) {
      throw new Error("音声データが取得できませんでした");
    }

    // audioContentを直接Bufferとして処理
    const audioBuffer = Buffer.isBuffer(response.audioContent)
      ? response.audioContent
      : Buffer.from(response.audioContent as Uint8Array);

    // Base64エンコード
    const base64Audio = audioBuffer.toString("base64");

    // ファイル名の生成
    const fileName = `${word}_${Date.now()}.mp3`;

    return { base64: base64Audio, fileName };
  } catch (error) {
    console.error("Error generating audio:", error);

    // より具体的なエラーメッセージを提供
    if (error instanceof Error) {
      throw new Error(`音声取得エラー: ${error.message}`);
    }

    throw new Error("音声取得中に不明なエラーが発生しました");
  }
}

export default getAudioFromGoogle;
