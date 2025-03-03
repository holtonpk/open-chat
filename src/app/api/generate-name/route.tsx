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
        model: "google/gemini-2.0-flash-001",
        messages: [
          {
            role: "user",
            content:
              "Generate a short descriptive name for the chat given the flowing messages **User:** " +
              body.messages.map((m: any) => m.content).join("\n") +
              "**",
          },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "name",
            strict: true,
            schema: {
              type: "object",
              properties: {
                name: {
                  type: "string",
                  description: "A short descriptive name for the chat",
                },
              },
              required: ["name"],
              additionalProperties: false,
            },
          },
        },
      }),
    }
  );
  const data = await completion.json();

  const name = JSON.parse(data.choices[0].message.content);

  return NextResponse.json({
    name: name.name,
  });
}

export async function GET() {
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
        model: "google/gemini-2.0-flash-001",
        messages: [
          {
            role: "user",
            content:
              "Generate a short descriptive name for the chat given the flowing messages **User:** " +
              messages.map((m) => m.content).join("\n") +
              "**",
          },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "name",
            strict: true,
            schema: {
              type: "object",
              properties: {
                name: {
                  type: "string",
                  description: "A short descriptive name for the chat",
                },
              },
              required: ["name"],
              additionalProperties: false,
            },
          },
        },
      }),
    }
  );
  const data = await completion.json();

  const name = JSON.parse(data.choices[0].message.content);

  return NextResponse.json({
    name: name.name,
  });
}

const messages = [
  {
    role: "user",
    content: "what is the square root of 144",
  },
  {
    role: "assistant",
    content:
      "The **square root of 144** is **±12**. This means that when you multiply 12 by itself, you get 144 ((12^2 = 144)), and similarly, when you multiply -12 by itself, you also get 144 (((-12)^2 = 144)) [1][2][3]. The square root can be found using various methods such as prime factorization, long division, or even the repeated subtraction method [2][3]. In radical form, it is denoted as (sqrt{144} = pm12).",
  },
];
