import { describe, expect, test } from "bun:test";
import { normalizeDate, parseRSS } from "./rss.ts";

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
