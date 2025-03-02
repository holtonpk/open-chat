import {NextResponse} from "next/server";
import type {NextApiRequest, NextApiResponse} from "next";

export async function GET() {
  const provider = "openai";

  try {
    const response = await fetch(`https://openrouter.ai/provider/${provider}`);
    if (!response.ok) throw new Error("Failed to fetch from OpenRouter");

    // const data = await response.json();
    return NextResponse.json(response);
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      {error: "Failed to fetch model icon"},
      {status: 500}
    );
  }
}
