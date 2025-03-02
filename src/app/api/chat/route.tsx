import {NextResponse} from "next/server";

// GET /api/credits
export async function GET(req: Request) {
  const credits = await getCredits();
  return NextResponse.json(credits);
}

const getCredits = async () => {
  const response = await fetch(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "HTTP-Referer": "<YOUR_SITE_URL>", // Optional. Site URL for rankings on openrouter.ai.
        "X-Title": "<YOUR_SITE_NAME>", // Optional. Site title for rankings on openrouter.ai.
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "perplexity/sonar",
        messages: [
          {
            role: "user",
            content: "How much investment has morty app received?",
          },
        ],
      }),
    }
  );

  const data = await response.json();
  return data;
};

// curl https://openrouter.ai/api/v1/credits \
//      -H "Authorization: Bearer <token>"
