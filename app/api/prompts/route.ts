// app/api/prompts/route.ts
import { getSettings } from "@/lib/minutes/settings";
import { NextResponse } from "next/server";

export async function GET() {
  const settings = await getSettings();
  const prompts = settings?.prompts || [];
  return NextResponse.json(prompts);
}
