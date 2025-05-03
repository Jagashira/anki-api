// utils/checkAnkiConnection.ts
export const checkAnkiConnection = async (): Promise<boolean> => {
  try {
    const res = await fetch("http://127.0.0.1:8765", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "version", version: 6 }),
    });

    const data = await res.json();
    return typeof data.result === "number";
  } catch {
    return false;
  }
};
