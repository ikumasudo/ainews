import type { RSSItem } from "../types.ts";
import { XMLParser, XMLValidator } from "fast-xml-parser";

const RSS_URL = "https://news.smol.ai/rss.xml";
const MAX_RSS_BYTES = 2 * 1024 * 1024;

const parser = new XMLParser({
  ignoreAttributes: false,
  parseTagValue: false,
  processEntities: true,
  trimValues: true,
});

export async function fetchRSSFeed(): Promise<RSSItem[]> {
  const response = await fetch(RSS_URL);
  if (!response.ok) {
    throw new Error(`RSS fetch failed: ${response.status}`);
  }
  const xml = await readTextWithLimit(response, MAX_RSS_BYTES);
  return parseRSS(xml);
}

async function readTextWithLimit(response: Response, maxBytes: number): Promise<string> {
  const declaredLength = Number(response.headers.get("content-length"));
  if (Number.isFinite(declaredLength) && declaredLength > maxBytes) {
    throw new Error(`RSS response exceeded ${maxBytes} bytes`);
  }

  if (!response.body) return "";

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let total = 0;
  let text = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > maxBytes) {
      await reader.cancel();
      throw new Error(`RSS response exceeded ${maxBytes} bytes`);
    }
    text += decoder.decode(value, { stream: true });
  }
  return text + decoder.decode();
}

function stringValue(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export function parseRSS(xml: string): RSSItem[] {
  const validation = XMLValidator.validate(xml);
  if (validation !== true) {
    throw new Error(`Invalid RSS XML: ${validation.err.msg}`);
  }

  const document: unknown = parser.parse(xml);
  if (!document || typeof document !== "object") return [];
  const rss = Reflect.get(document, "rss");
  if (!rss || typeof rss !== "object") return [];
  const channel = Reflect.get(rss, "channel");
  if (!channel || typeof channel !== "object") return [];
  const rawItems = Reflect.get(channel, "item");
  const items = Array.isArray(rawItems) ? rawItems : rawItems ? [rawItems] : [];

  return items.flatMap((item): RSSItem[] => {
    if (!item || typeof item !== "object") return [];
    const title = stringValue(Reflect.get(item, "title"));
    const link = stringValue(Reflect.get(item, "link"));
    const pubDate = stringValue(Reflect.get(item, "pubDate"));
    const content =
      stringValue(Reflect.get(item, "content:encoded")) ||
      stringValue(Reflect.get(item, "description"));
    return title && link && pubDate && content
      ? [{ title, link, pubDate, content }]
      : [];
  });
}

export function normalizeDate(pubDate: string): string {
  const date = new Date(pubDate);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid RSS publication date: ${pubDate}`);
  }
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
