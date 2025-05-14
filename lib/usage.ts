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

// * @param duration 秒（例：80.5秒）
// * @param exchangeRate 為替（デフォルト150円/USD）
// */
export const calculateWhisperUsage = (
  duration: number,
  exchangeRate = 150
): { usd: number; jpy: number } => {
  const costPerSecondUSD = 0.006 / 60;
  const usd = duration * costPerSecondUSD;
  const jpy = usd * exchangeRate;

  return {
    usd: parseFloat(usd.toFixed(10)),
    jpy: Math.round(jpy),
  };
};
