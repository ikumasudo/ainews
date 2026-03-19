import type { RSSItem } from "../types.ts";

const RSS_URL = "https://news.smol.ai/rss.xml";

export async function fetchRSSFeed(): Promise<RSSItem[]> {
  const response = await fetch(RSS_URL);
  if (!response.ok) {
    throw new Error(`RSS fetch failed: ${response.status}`);
  }
  const xml = await response.text();
  return parseRSS(xml);
}

function parseRSS(xml: string): RSSItem[] {
  const items: RSSItem[] = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match: RegExpExecArray | null;

  while ((match = itemRegex.exec(xml)) !== null) {
    const itemXml = match[1]!;
    const title = extractTag(itemXml, "title");
    const link = extractTag(itemXml, "link");
    const pubDate = extractTag(itemXml, "pubDate");
    const content =
      extractTag(itemXml, "content:encoded") ||
      extractTag(itemXml, "description");

    if (title && link && pubDate && content) {
      items.push({
        title,
        link,
        pubDate,
        content,
      });
    }
  }

  return items;
}

function extractTag(xml: string, tag: string): string {
  const escapedTag = tag.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const cdataMatch = new RegExp(
    `<${escapedTag}[^>]*>\\s*<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>\\s*</${escapedTag}>`
  ).exec(xml);
  if (cdataMatch) return cdataMatch[1]!.trim();

  const match = new RegExp(
    `<${escapedTag}[^>]*>([\\s\\S]*?)</${escapedTag}>`
  ).exec(xml);
  return match ? decodeXMLEntities(match[1]!.trim()) : "";
}

function decodeXMLEntities(str: string): string {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

export function normalizeDate(pubDate: string): string {
  const date = new Date(pubDate);
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
