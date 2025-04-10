// lib/getImageUrl.ts
export async function getImageUrl(query: string): Promise<string | null> {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  console.log(accessKey);
  const res = await fetch(
    `https://api.unsplash.com/photos/random?query=${encodeURIComponent(
      query
    )}&client_id=${accessKey}`
  );

  if (!res.ok) {
    console.error("画像取得エラー:", res.statusText);
    return null;
  }

  const data = await res.json();
  return data?.urls?.small || null;
}
