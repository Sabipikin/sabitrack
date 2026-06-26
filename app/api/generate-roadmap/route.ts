import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "AI service not configured" },
      { status: 500 }
    );
  }

  const { title, duration, motivation, category } = await request.json();

  if (!title || !duration || !motivation || !category) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        system:
          "You are a strategic execution planner. Return ONLY valid JSON. No markdown, no backticks, no preamble.",
        messages: [
          {
            role: "user",
            content: `Create a practical accountability roadmap:\nGoal: ${title}\nDuration: ${duration}\nWhy: ${motivation}\nCategory: ${category}\n\nReturn exactly: {"year_target":"one motivating sentence","quarter_target":"one sentence","month_targets":["target 1","target 2"],"week_targets":["target 1","target 2"],"daily_targets":["concrete task 1","concrete task 2","concrete task 3"]}`,
          },
        ],
      }),
    });

    if (!res.ok) {
      const errBody = await res.text();
      console.error("Anthropic API error:", res.status, errBody);
      return NextResponse.json(
        { error: "AI generation failed" },
        { status: 502 }
      );
    }

    const data = await res.json();
    const text = data.content[0].text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(text);

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Roadmap generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate roadmap" },
      { status: 500 }
    );
  }
}
