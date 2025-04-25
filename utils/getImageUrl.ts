// lib/getImageUrl.ts
export async function getImageUrl(query: string): Promise<string | null> {
  const apiKey = process.env.PEXELS_API_KEY;

  if (!apiKey) {
    console.error("Pexels APIキーが設定されていません");
    return null;
  }

  const res = await fetch(
    `https://api.pexels.com/v1/search?query=${encodeURIComponent(
      query
    )}&per_page=1`,
    {
      headers: {
        Authorization: apiKey,
      },
    }
  );

  if (!res.ok) {
    console.error("画像取得エラー:", res.statusText);
    return null;
  }

  const data = await res.json();

  // 最初の画像のURLを取得
  return data?.photos?.[0]?.src?.medium || null;
}
