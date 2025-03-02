import {NextResponse} from "next/server";

export async function POST(req: Request) {
  const body = await req.json();

  const completion = await fetch(
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
        model: `${body.model}${body.isOnline ? ":online" : ""}`,
        messages: body.messages,
        plugins: body.isOnline
          ? [
              {
                id: "web",
                max_results: 5,
                search_prompt:
                  "A web search was conducted on `date`. Incorporate the following web search results into your response. IMPORTANT: Cite them using markdown links named using the domain of the source. Example: [nytimes.com](https://nytimes.com/some-page).",
              },
            ]
          : [],
      }),
    }
  );
  const data = await completion.json();

  return NextResponse.json({
    message: data.choices[0].message,
    usage: data.usage,
    // citations: undefined,
    citations: data?.citations || undefined,
  });
}

export async function GET() {
  //   const completion = await openai.chat.completions.create({
  //     model: "openrouter/auto",
  //     messages: [
  //       {
  //         role: "user",
  //         content: "Is oral nicotine better than vaping?",
  //       },
  //     ],
  //     plugins: [
  //       {
  //         id: "web",
  //         max_results: 1, // Defaults to 5
  //         search_prompt: "Some relevant web results:", // See default below
  //       },
  //     ],
  //   });
  const completion = await fetch(
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
        model: "openai/gpt-4o",
        messages: [
          {
            role: "user",
            content: "Generate an image of a cat",
          },
        ],
      }),
    }
  );
  const data = await completion.json();

  return NextResponse.json({
    message: data.choices[0].message,
    usage: data.usage,
    // citations: undefined,
    citations: data?.citations || undefined,
  });
}
