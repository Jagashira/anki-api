// 音声の長さ（秒）からWhisperのusageを計算する関数
export const calculateUsage = (duration: number): number => {
  // 例えば、1秒あたりのコストを設定 (USD)
  const costPerSecond = 0.0001; // この値はWhisperのAPIコストに基づいて設定
  return duration * costPerSecond;
};

export const getAudioDuration = (audioBlob: Blob): Promise<number> => {
  return new Promise((resolve, reject) => {
    const audioContext = new (window.AudioContext ||
      //@ts-ignore
      window.webkitAudioContext)();
    const reader = new FileReader();

    reader.onloadend = () => {
      audioContext.decodeAudioData(
        reader.result as ArrayBuffer,
        (buffer) => {
          resolve(buffer.duration); // 音声の長さ（秒）
        },
        (error) => {
          reject(error);
        }
      );
    };

    reader.onerror = reject;
    reader.readAsArrayBuffer(audioBlob);
  });
};
