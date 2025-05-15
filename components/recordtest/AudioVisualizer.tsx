"use client";
import React, { useEffect, useRef } from "react";

interface Props {
  audioStream: MediaStream | null;
  active: boolean;
}

const AudioHistoryBars: React.FC<Props> = ({ audioStream, active }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const historyRef = useRef<number[]>([]); // useRefで履歴保持

  useEffect(() => {
    if (!active || !audioStream) return;

    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    canvas.width = 300;
    canvas.height = 50;

    const barWidth = 3;
    const barGap = 2;
    const maxBars = Math.floor(canvas.width / (barWidth + barGap));

    const audioCtx = new AudioContext();
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 256;
    const bufferLength = analyser.fftSize;
    const dataArray = new Uint8Array(bufferLength);

    const source = audioCtx.createMediaStreamSource(audioStream);
    source.connect(analyser);
    let frameCount = 0;

    const draw = () => {
      analyser.getByteTimeDomainData(dataArray);

      // フレーム数で制御して、3フレームに1回だけ履歴更新
      if (frameCount % 3 === 0) {
        const middle = bufferLength / 2;
        const volume = Math.abs(dataArray[middle] - 128) / 128;

        const updated = [...historyRef.current, volume];
        if (updated.length > maxBars) updated.shift();
        historyRef.current = updated;
      }

      // 描画処理（毎フレーム実行）
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const centerY = canvas.height / 2;

      historyRef.current.forEach((vol, i) => {
        const height = vol * canvas.height;
        const x = i * (barWidth + barGap);
        const y = centerY - height / 2;
        ctx.fillStyle = "#000";
        ctx.fillRect(x, y, barWidth, height);
      });

      frameCount++;
      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationRef.current);
      audioCtx.close();
    };
  }, [audioStream, active]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-12"
      style={{ backgroundColor: "transparent", display: "block" }}
    />
  );
};

export default AudioHistoryBars;
