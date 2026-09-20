import type { RSSItem } from "../types.ts";
import { XMLParser, XMLValidator } from "fast-xml-parser";

const RSS_URL = "https://news.smol.ai/rss.xml";
const MAX_RSS_PREFIX_BYTES = 2 * 1024 * 1024;
const MAX_RSS_ITEMS = 50;
const ITEM_END_TAG = "</item>";

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
  const xml = await readRSSPrefix(
    response,
    MAX_RSS_PREFIX_BYTES,
    MAX_RSS_ITEMS
  );
  return parseRSS(xml);
}

/**
 * Read only the newest part of the feed. news.smol.ai keeps its full history in
 * one ever-growing XML document, with newest items first, so buffering the
 * complete response would eventually exceed any fixed size limit.
 */
export async function readRSSPrefix(
  response: Response,
  maxBytes: number,
  maxItems: number
): Promise<string> {
  if (!Number.isInteger(maxItems) || maxItems < 1) {
    throw new Error("maxItems must be a positive integer");
  }

  if (!response.body) return "";

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let total = 0;
  let text = "";
  let scanFrom = 0;
  let itemCount = 0;

  while (true) {
    const { done, value } = await reader.read();

    if (value) {
      total += value.byteLength;
      if (total > maxBytes) {
        await reader.cancel();
        throw new Error(
          `RSS prefix exceeded ${maxBytes} bytes before ${maxItems} items were read`
        );
      }
      text += decoder.decode(value, { stream: true });
    }

    if (done) {
      return text + decoder.decode();
    }

    while (true) {
      const itemEnd = text.indexOf(ITEM_END_TAG, scanFrom);
      if (itemEnd === -1) break;

      itemCount++;
      scanFrom = itemEnd + ITEM_END_TAG.length;
      if (itemCount === maxItems) {
        await reader.cancel();
        return `${text.slice(0, scanFrom)}</channel></rss>`;
      }
    }
  }
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
  try {
    return new Date(pubDate).toISOString().slice(0, 10);
  } catch {
    throw new Error(`Invalid RSS publication date: ${pubDate}`);
  }
}
