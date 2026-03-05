import type { AIHighlightResult } from "../types.ts";

export function stripHTML(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

const PROMPT = `You are an AI news analyst. Extract the 5-8 most important news items from the following AI news digest.
For each item, provide:
- title: A concise headline (in the original language of the news)
- summary: 2-3 sentence summary (in Japanese)
- importance: "high" for major breakthroughs/releases/funding, "medium" for notable but less impactful news
- category: one of "model_release", "funding", "research", "product", "policy", "other"

Respond ONLY with a valid JSON array. No markdown, no explanation.
Example format:
[{"title":"Example Title","summary":"要約文","importance":"high","category":"model_release"}]

Digest:
`;

export async function extractHighlights(
  apiKey: string,
  rawContent: string
): Promise<AIHighlightResult[]> {
  const plainText = stripHTML(rawContent);
  // Truncate to ~50000 chars (Sonnet 4.6 has 200K context, but limit for cost control)
  const truncated = plainText.slice(0, 50000);

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "anthropic/claude-sonnet-4.6",
      messages: [{ role: "user", content: PROMPT + truncated }],
      max_tokens: 4096,
      temperature: 0.3,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`OpenRouter API error (${response.status}): ${errorBody}`);
  }

  const data = (await response.json()) as {
    choices: { message: { content: string } }[];
  };
  const responseText = data.choices[0]?.message?.content ?? "";

  // Extract JSON array from response
  const jsonMatch = responseText.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    throw new Error("AI response did not contain valid JSON array");
  }

  const parsed: AIHighlightResult[] = JSON.parse(jsonMatch[0]);

  // Validate and normalize
  const validCategories = new Set([
    "model_release",
    "funding",
    "research",
    "product",
    "policy",
    "other",
  ]);

  return parsed
    .filter(
      (item) =>
        item.title && item.summary && item.importance && item.category
    )
    .map((item) => ({
      title: item.title,
      summary: item.summary,
      importance: item.importance === "high" ? "high" : "medium",
      category: validCategories.has(item.category)
        ? item.category
        : "other",
    }));
}
