"use client";

import { useEffect, useRef } from "react";

type Props = {
  stream: MediaStream | null;
  active: boolean;
};

export default function WaveformVisualizer({ stream, active }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const historyRef = useRef<number[]>([]);

  useEffect(() => {
    if (!active || !stream) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = 600;
    canvas.height = 60;

    const audioCtx = new AudioContext();
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 256;
    const bufferLength = analyser.fftSize;
    const dataArray = new Uint8Array(bufferLength);
    const source = audioCtx.createMediaStreamSource(stream);
    source.connect(analyser);

    const barWidth = 4;
    const barGap = 2;
    const maxBars = Math.floor(canvas.width / (barWidth + barGap));
    let frameCount = 0;

    const draw = () => {
      analyser.getByteTimeDomainData(dataArray);

      if (frameCount % 2 === 0) {
        const middle = Math.floor(bufferLength / 2);
        const volume = Math.abs(dataArray[middle] - 128) / 128;
        const updated = [...historyRef.current, volume];
        if (updated.length > maxBars) updated.shift();
        historyRef.current = updated;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const centerY = canvas.height / 2;

      historyRef.current.forEach((vol, i) => {
        const height = vol * canvas.height;
        const x = i * (barWidth + barGap);
        const y = centerY - height / 2;

        const gradient = ctx.createLinearGradient(x, y, x, y + height);
        gradient.addColorStop(0, "#60a5fa"); // blue-400
        gradient.addColorStop(1, "#3b82f6"); // blue-500

        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, barWidth, height);
      });

      frameCount++;
      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      audioCtx.close();
    };
  }, [stream, active]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-16 rounded bg-gray-100 shadow-inner"
    />
  );
}
