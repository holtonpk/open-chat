import {NextResponse} from "next/server";

// GET /api/credits
export async function GET(req: Request) {
  const credits = await getCredits();
  return NextResponse.json(credits);
}

const getCredits = async () => {
  const response = await fetch("https://openrouter.ai/api/v1/credits", {
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
    },
  });
  const data = await response.json();
  return data;
};

// curl https://openrouter.ai/api/v1/credits \
//      -H "Authorization: Bearer <token>"
