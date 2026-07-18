import { describe, expect, test } from "bun:test";
import type { AIHighlightResult } from "../types.ts";
import { parseHighlightResponse } from "./ai.ts";

const validItem = {
  title: "New model",
  summary: "新しいモデルが公開された。性能が向上している。",
  importance: "high",
  category: "model_release",
  link: "https://example.com/news",
} satisfies AIHighlightResult;

describe("parseHighlightResponse", () => {
  test("validates a JSON response", () => {
    expect(parseHighlightResponse(JSON.stringify([validItem]))).toEqual([validItem]);
  });

  test("accepts a JSON code fence", () => {
    const response = `\`\`\`json\n${JSON.stringify([validItem])}\n\`\`\``;
    expect(parseHighlightResponse(response)).toEqual([validItem]);
  });

  test("rejects unknown categories instead of silently normalizing them", () => {
    const response = JSON.stringify([{ ...validItem, category: "security" }]);
    expect(() => parseHighlightResponse(response)).toThrow("AI response schema validation failed");
  });

  test("rejects malformed URLs and unexpected fields", () => {
    const response = JSON.stringify([
      { ...validItem, link: "javascript:alert(1)", extra: true },
    ]);
    expect(() => parseHighlightResponse(response)).toThrow("AI response schema validation failed");
  });

  test("rejects more than eight highlights", () => {
    const response = JSON.stringify(Array.from({ length: 9 }, () => validItem));
    expect(() => parseHighlightResponse(response)).toThrow("AI response schema validation failed");
  });
});
