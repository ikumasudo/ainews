import { describe, expect, test } from "bun:test";
import { normalizeDate, parseRSS, readRSSPrefix } from "./rss.ts";

function rssWithItems(count: number): string {
  const items = Array.from(
    { length: count },
    (_, index) => `<item>
      <title>Item ${index + 1}</title>
      <link>https://example.com/${index + 1}</link>
      <pubDate>Fri, ${String(index + 1).padStart(2, "0")} Aug 2026 00:00:00 GMT</pubDate>
      <description>Description ${index + 1}</description>
    </item>`
  ).join("");
  return `<rss><channel><title>Feed</title>${items}</channel></rss>`;
}

describe("parseRSS", () => {
  test("parses multiple items, CDATA, namespaces, and XML entities", () => {
    const xml = `<?xml version="1.0"?>
      <rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/">
        <channel>
          <item>
            <title><![CDATA[Models & tools]]></title>
            <link>https://example.com/one?x=1&amp;y=2</link>
            <pubDate>Fri, 17 Jul 2026 12:00:00 GMT</pubDate>
            <content:encoded><![CDATA[<p>First <strong>story</strong></p>]]></content:encoded>
          </item>
          <item>
            <title>Research &amp; Policy</title>
            <link>https://example.com/two</link>
            <pubDate>Sat, 18 Jul 2026 00:00:00 GMT</pubDate>
            <description>Fallback description</description>
          </item>
        </channel>
      </rss>`;

    expect(parseRSS(xml)).toEqual([
      {
        title: "Models & tools",
        link: "https://example.com/one?x=1&y=2",
        pubDate: "Fri, 17 Jul 2026 12:00:00 GMT",
        content: "<p>First <strong>story</strong></p>",
      },
      {
        title: "Research & Policy",
        link: "https://example.com/two",
        pubDate: "Sat, 18 Jul 2026 00:00:00 GMT",
        content: "Fallback description",
      },
    ]);
  });

  test("skips incomplete items", () => {
    const xml = `<rss><channel><item><title>Missing fields</title></item></channel></rss>`;
    expect(parseRSS(xml)).toEqual([]);
  });

  test("rejects malformed XML", () => {
    expect(() => parseRSS("<rss><channel><item></rss>")).toThrow("Invalid RSS XML");
  });
});

describe("normalizeDate", () => {
  test("normalizes a valid date in UTC", () => {
    expect(normalizeDate("Fri, 17 Jul 2026 23:30:00 -0700")).toBe("2026-07-18");
  });

  test("rejects an invalid publication date", () => {
    expect(() => normalizeDate("not-a-date")).toThrow("Invalid RSS publication date");
  });
});

describe("readRSSPrefix", () => {
  test("reads only the requested newest items from a larger declared response", async () => {
    const response = new Response(rssWithItems(3), {
      headers: { "content-length": String(3 * 1024 * 1024) },
    });

    const prefix = await readRSSPrefix(response, 1024 * 1024, 2);

    expect(parseRSS(prefix).map((item) => item.title)).toEqual([
      "Item 1",
      "Item 2",
    ]);
  });

  test("recognizes an item closing tag split across stream chunks", async () => {
    const xml = rssWithItems(2);
    const splitAt = xml.indexOf("</item>") + 4;
    const encoder = new TextEncoder();
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(encoder.encode(xml.slice(0, splitAt)));
        controller.enqueue(encoder.encode(xml.slice(splitAt)));
        controller.close();
      },
    });

    const prefix = await readRSSPrefix(new Response(stream), 1024 * 1024, 1);

    expect(parseRSS(prefix)).toHaveLength(1);
  });

  test("fails when the prefix limit is reached before an item is complete", async () => {
    const response = new Response(`<rss><channel>${"x".repeat(200)}`);

    await expect(readRSSPrefix(response, 100, 1)).rejects.toThrow(
      "RSS prefix exceeded 100 bytes"
    );
  });
});
