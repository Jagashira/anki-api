import type { NextApiRequest, NextApiResponse } from "next";

interface MessageSchema {
  role: "assistant" | "user" | "system";
  content: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: req.body.messages,
    }),
  });

  const { choices, error } = await response.json();
  if (response.ok) {
    const message = choices[0]?.message?.content;
    if (message) {
      res.status(200).json({ role: "system", content: message });
    } else {
      res.status(500).send("No message from OpenAI.");
    }
  } else {
    res.status(500).json({ error });
  }
}
