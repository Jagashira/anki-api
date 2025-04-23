import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY; // 環境変数でAPIキーを管理

export async function POST(res: NextApiResponse) {
  try {
    const response = await axios.get("https://api.openai.com/v1/usage", {
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
    });
    console.log("Usage data:", response.data);
    res.status(200).json(response.data || {});
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch usage" });
  }
}
