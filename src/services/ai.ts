import type { AIHighlightResult } from "../types.ts";
import { z } from "zod";

const categorySchema = z.enum([
  "model_release",
  "funding",
  "research",
  "product",
  "policy",
  "other",
]);

const httpUrlSchema = z.string().refine((value) => {
  if (value === "") return true;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}, "link must be an empty string or an HTTP(S) URL");

const highlightSchema = z
  .object({
    title: z.string().trim().min(1).max(300),
    summary: z.string().trim().min(1).max(2_000),
    importance: z.enum(["high", "medium"]),
    category: categorySchema,
    link: httpUrlSchema,
  })
  .strict();

const highlightResponseSchema = z.array(highlightSchema).min(1).max(8);

export function extractLinks(html: string): string {
  return html.replace(/<a\s[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi, (_, url, text) => {
    const cleanText = text.replace(/<[^>]+>/g, "").trim();
    return `${cleanText} (${url})`;
  });
}

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
- link: The most relevant URL referenced in the news item (from the URLs in parentheses in the text). Use empty string "" if no URL is available.

Respond ONLY with a valid JSON array. No markdown, no explanation.
Example format:
[{"title":"Example Title","summary":"要約文","importance":"high","category":"model_release","link":"https://example.com/article"}]

Digest:
`;

export function parseHighlightResponse(responseText: string): AIHighlightResult[] {
  const trimmed = responseText.trim();
  const jsonText = trimmed.startsWith("```")
    ? trimmed.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "")
    : trimmed;

  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonText);
  } catch {
    throw new Error("AI response was not valid JSON");
  }

  const result = highlightResponseSchema.safeParse(parsed);
  if (!result.success) {
    const issues = result.error.issues
      .slice(0, 3)
      .map((issue) => `${issue.path.join(".") || "response"}: ${issue.message}`)
      .join("; ");
    throw new Error(`AI response schema validation failed: ${issues}`);
  }

  return result.data;
}

export async function extractHighlights(
  apiKey: string,
  rawContent: string
): Promise<AIHighlightResult[]> {
  const withLinks = extractLinks(rawContent);
  const plainText = stripHTML(withLinks);
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

  return parseHighlightResponse(responseText);
}
