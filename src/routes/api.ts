import { Hono } from "hono";
import type { Env } from "../types.ts";
import {
  getHighlightsByDate,
  getAvailableDates,
  saveDigest,
  saveHighlights,
  getUnprocessedDigests,
} from "../services/db.ts";
import { fetchRSSFeed, normalizeDate } from "../services/rss.ts";
import { extractHighlights } from "../services/ai.ts";

const api = new Hono<{ Bindings: Env }>();

// Get highlights for a specific date
api.get("/highlights/:date", async (c) => {
  const date = c.req.param("date");
  const cache = c.env.CACHE;

  // Check KV cache
  const cacheKey = `api:highlights:${date}`;
  const cached = await cache.get(cacheKey, "json");
  if (cached) {
    return c.json(cached);
  }

  const highlights = await getHighlightsByDate(c.env.DB, date);
  const response = { date, highlights, count: highlights.length };

  // Cache for 1 hour
  c.executionCtx.waitUntil(
    cache.put(cacheKey, JSON.stringify(response), { expirationTtl: 3600 })
  );

  return c.json(response);
});

// Get available dates
api.get("/dates", async (c) => {
  const cache = c.env.CACHE;
  const cacheKey = "api:dates";
  const cached = await cache.get(cacheKey, "json");
  if (cached) {
    return c.json(cached);
  }

  const dates = await getAvailableDates(c.env.DB);
  const response = { dates };

  c.executionCtx.waitUntil(
    cache.put(cacheKey, JSON.stringify(response), { expirationTtl: 600 })
  );

  return c.json(response);
});

// Manual fetch & process trigger
api.post("/fetch", async (c) => {
  const db = c.env.DB;

  // 1. Fetch RSS
  const items = await fetchRSSFeed();
  let newCount = 0;

  for (const item of items) {
    const date = normalizeDate(item.pubDate);
    const digestId = await saveDigest(db, {
      date,
      title: item.title,
      link: item.link,
      pub_date: item.pubDate,
      raw_content: item.content,
    });
    if (digestId > 0) {
      newCount++;
    }
  }

  // 2. Process unprocessed digests with AI
  const unprocessed = await getUnprocessedDigests(db);
  let processedCount = 0;

  for (const digest of unprocessed) {
    try {
      const highlights = await extractHighlights(c.env.OPENROUTER_API_KEY, digest.raw_content);
      await saveHighlights(db, digest.id, highlights);
      processedCount++;
    } catch (e) {
      console.error(`Failed to process digest ${digest.date}:`, e);
    }
  }

  // 3. Clear caches
  const dates = await getAvailableDates(db);
  const deletePromises = [
    c.env.CACHE.delete("api:dates"),
    ...dates.map((d) =>
      Promise.all([
        c.env.CACHE.delete(`page:${d}`),
        c.env.CACHE.delete(`api:highlights:${d}`),
      ])
    ),
  ];
  await Promise.all(deletePromises);

  return c.json({
    fetched: items.length,
    new_digests: newCount,
    processed: processedCount,
  });
});

export default api;
