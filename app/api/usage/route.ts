import { NextRequest, NextResponse } from "next/server";
import { getUnixTimeRange } from "@/app/lib/getUnixTimeRange";

export async function GET(req: NextRequest) {
  console.log("USAGE API CALLED");
  console.log("Date:", new Date().toISOString());

  const OPENAI_ADMIN_API_KEY = process.env.OPENAI_ADMIN_KEY;
  if (!OPENAI_ADMIN_API_KEY) {
    return NextResponse.json(
      { error: "OPENAI_ADMIN_KEY is not set" },
      { status: 500 }
    );
  }
  try {
    const range =
      (req.nextUrl.searchParams.get("range") as
        | "today"
        | "this_week"
        | "this_month") || "today";

    const { start_time, end_time } = getUnixTimeRange(range);

    const maxLimit = 31;
    const daysRequested = Math.ceil((end_time - start_time) / (60 * 60 * 24));
    const limit = Math.min(daysRequested, maxLimit);

    const response = await fetch(
      `https://api.openai.com/v1/organization/usage/completions?start_time=${start_time}&end_time=${end_time}&limit=${limit}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${OPENAI_ADMIN_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to fetch usage data: ${JSON.stringify(error)}`);
    }

    const data = await response.json();
    console.log("USAGE DATA:", data);

    // 整形データの例（必要に応じて変更可）
    const usageData = data.data.map((bucket: any) => {
      const result = bucket.results?.[0];
      return {
        date: new Date(bucket.start_time * 1000).toISOString().split("T")[0],
        input_tokens: result?.input_tokens || 0,
        output_tokens: result?.output_tokens || 0,
        total_tokens:
          (result?.input_tokens || 0) + (result?.output_tokens || 0),
        requests: result?.num_model_requests || 0,
        response_time: 0, // オプション：計測していない場合は仮で 0 に
      };
    });

    return NextResponse.json(usageData);
  } catch (error) {
    console.error("Error fetching usage data:", error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
