export async function fetchSummary(text: string): Promise<string> {
  try {
    const res = await fetch("/api/summary", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });

    const json = await res.json();
    return json.summary || "要約に失敗しました";
  } catch (err) {
    return "要約中にエラーが発生しました";
  }
}
