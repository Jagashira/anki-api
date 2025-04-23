import { useRef, useState } from "react";
import { Button, Group, Text } from "@mantine/core";
import { IconMicrophone, IconPlayerStop, IconSend } from "@tabler/icons-react";
import { Flex } from "@mantine/core"; // Flexをインポート

interface Props {
  onComplete: (audioBlob: Blob) => void; // 音声録音後に親コンポーネントへ送信するためのコールバック
}

export default function Recorder({ onComplete }: Props) {
  const [recording, setRecording] = useState(false); // 録音中かどうかの状態
  const [audioURL, setAudioURL] = useState<string | null>(null); // 録音した音声のURL
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null); // 録音した音声データ（Blob）
  const mediaRecorderRef = useRef<MediaRecorder | null>(null); // MediaRecorderの参照
  const audioChunksRef = useRef<Blob[]>([]); // 録音データのチャンクを保持する配列

  // 録音開始
  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true }); // マイクへのアクセス
    const mediaRecorder = new MediaRecorder(stream); // MediaRecorderのインスタンス作成
    mediaRecorderRef.current = mediaRecorder;
    audioChunksRef.current = []; // 以前の録音データをクリア

    // 録音データが取得された時の処理
    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        audioChunksRef.current.push(e.data);
      }
    };

    // 録音停止後の処理
    mediaRecorder.onstop = () => {
      const blob = new Blob(audioChunksRef.current, { type: "audio/webm" }); // Blobとして録音データを生成
      setAudioBlob(blob); // Blobデータを保存
      setAudioURL(URL.createObjectURL(blob)); // 音声URLを生成
    };

    mediaRecorder.start(); // 録音開始
    setRecording(true); // 録音中の状態に変更
  };

  // 録音停止
  const stopRecording = () => {
    mediaRecorderRef.current?.stop(); // 録音停止
    setRecording(false); // 録音停止の状態に変更
  };

  // 録音データを親コンポーネントに送信
  const sendRecording = () => {
    if (audioBlob) {
      onComplete(audioBlob); // 親コンポーネントに音声データを渡す
      setAudioBlob(null); // 音声データをクリア
      setAudioURL(null); // 音声URLをクリア
    }
  };

  return (
    <Flex direction="column" align="center" gap="md">
      {!recording ? (
        <Button onClick={startRecording} leftSection={<IconMicrophone />}>
          録音開始
        </Button>
      ) : (
        <Button
          onClick={stopRecording}
          color="red"
          leftSection={<IconPlayerStop />}
        >
          停止
        </Button>
      )}

      {/* 録音後に音声URLが存在する場合、再生と送信ボタンを表示 */}
      {audioURL && (
        <>
          <audio controls src={audioURL} />
          <Button
            onClick={sendRecording}
            color="green"
            leftSection={<IconSend />}
          >
            Whisperへ送信
          </Button>
        </>
      )}
    </Flex>
  );
}
