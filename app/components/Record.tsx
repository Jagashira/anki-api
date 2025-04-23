// components/AudioRecorder.tsx
import { useRef, useState } from "react";
import { Button, Group, Text } from "@mantine/core";
import { IconMicrophone, IconPlayerStop, IconSend } from "@tabler/icons-react";

interface Props {
  onComplete: (audioBlob: Blob) => void;
}

export default function AudioRecorder({ onComplete }: Props) {
  const [recording, setRecording] = useState(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;
    audioChunksRef.current = [];

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        audioChunksRef.current.push(e.data);
      }
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
      setAudioBlob(blob);
      setAudioURL(URL.createObjectURL(blob));
    };

    mediaRecorder.start();
    setRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  };

  const sendRecording = () => {
    if (audioBlob) {
      onComplete(audioBlob);
      setAudioBlob(null);
      setAudioURL(null);
    }
  };

  return (
    <Group>
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
    </Group>
  );
}
