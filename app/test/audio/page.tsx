// app/your-page/page.tsx または relevant component
"use client";

import { useState, useRef } from "react";

export default function AudioRecorderPage() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState<string>(""); // audioURLも型を指定するとより安全
  const mediaRecorderRef = useRef<MediaRecorder | null>(null); // ★修正点: MediaRecorderまたはnullを許容する型を指定
  const audioChunksRef = useRef<Blob[]>([]); // Blobの配列であることを明示

  const getMicrophonePermission = async (): Promise<MediaStream | null> => {
    // 返り値の型を明示
    if (typeof window !== "undefined" && "MediaRecorder" in window) {
      // windowオブジェクトの存在確認を追加
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        return stream;
      } catch (err) {
        console.error("マイクへのアクセスが拒否されました:", err);
        alert("マイクへのアクセスを許可してください。");
        return null;
      }
    } else {
      if (typeof window !== "undefined") {
        // windowオブジェクトが存在する場合のみalert
        alert("お使いのブラウザはMediaRecorderをサポートしていません。");
      }
      return null;
    }
  };

  const startRecording = async () => {
    const stream = await getMicrophonePermission();
    if (!stream) return;

    setIsRecording(true);
    setAudioURL("");
    audioChunksRef.current = [];

    try {
      // Safariでの推奨MIMEタイプを確認・指定する（例: audio/mp4; codecs=aac）
      // const options = { mimeType: 'audio/webm' }; // デフォルト、または適切なMIMEタイプ
      // if (MediaRecorder.isTypeSupported('audio/mp4')) {
      //   options.mimeType = 'audio/mp4';
      // } else if (MediaRecorder.isTypeSupported('audio/aac')) { // 稀だが存在する可能性
      //   options.mimeType = 'audio/aac';
      // } else if (!MediaRecorder.isTypeSupported('audio/webm')) {
      //    console.warn("audio/webm is not supported, trying default");
      // }
      // mediaRecorderRef.current = new MediaRecorder(stream, options);

      mediaRecorderRef.current = new MediaRecorder(stream); //  ひとまずデフォルトで試す

      mediaRecorderRef.current.ondataavailable = (event: BlobEvent) => {
        // eventの型を明示
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        // 適切なMIMEタイプでBlobを作成
        const audioBlob = new Blob(audioChunksRef.current, {
          type: mediaRecorderRef.current?.mimeType || "audio/webm",
        });
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioURL(audioUrl);
        // audioChunksRef.current = []; // ここでクリアするとダウンロードリンクなどに影響する可能性があるので注意

        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current.start();
      console.log("録音開始", mediaRecorderRef.current.mimeType);
    } catch (e) {
      console.error("MediaRecorderの初期化に失敗:", e);
      alert(
        "録音の開始に失敗しました。対応していないフォーマットの可能性があります。"
      );
      setIsRecording(false);
      stream.getTracks().forEach((track) => track.stop()); // ストリームを閉じる
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      console.log("録音停止");
      // audioChunksRef.current = []; // ここでクリアするかは要件次第
    }
  };

  return (
    <div>
      <h1>iOS Safari 録音 & 再生 (Next.js App Router)</h1>
      <div>
        {!isRecording ? (
          <button onClick={startRecording} disabled={isRecording}>
            録音開始
          </button>
        ) : (
          <button onClick={stopRecording} disabled={!isRecording}>
            録音停止
          </button>
        )}
      </div>
      {audioURL && (
        <div style={{ marginTop: "20px" }}>
          <h2>録音結果:</h2>
          <audio src={audioURL} controls />
          <p>
            <a
              href={audioURL}
              download={`recording.${
                mediaRecorderRef.current?.mimeType
                  .split("/")[1]
                  .split(";")[0] || "webm"
              }`}
            >
              録音をダウンロード
            </a>
          </p>
        </div>
      )}
      {/* ... (以下略) ... */}
    </div>
  );
}
