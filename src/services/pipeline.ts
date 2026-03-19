import type { Env } from "../types.ts";
import { fetchRSSFeed, normalizeDate } from "./rss.ts";
import {
  saveDigest,
  saveHighlights,
  getUnprocessedDigests,
} from "./db.ts";
import { extractHighlights } from "./ai.ts";

export async function processFeedsAndClearCache(env: Env): Promise<{
  fetched: number;
  new_digests: number;
  processed: number;
}> {
  // 1. Fetch and save new RSS items
  const items = await fetchRSSFeed();
  const affectedDates = new Set<string>();
  let newCount = 0;

  for (const item of items) {
    const date = normalizeDate(item.pubDate);
    const digestId = await saveDigest(env.DB, {
      date,
      title: item.title,
      link: item.link,
      pub_date: item.pubDate,
      raw_content: item.content,
    });
    if (digestId > 0) {
      newCount++;
      affectedDates.add(date);
    }
  }

  // 2. Process unprocessed digests with AI
  const unprocessed = await getUnprocessedDigests(env.DB);
  let processedCount = 0;

  for (const digest of unprocessed) {
    try {
      const highlights = await extractHighlights(env.OPENROUTER_API_KEY, digest.raw_content);
      await saveHighlights(env.DB, digest.id, highlights);
      affectedDates.add(digest.date);
      processedCount++;
    } catch (e) {
      console.error(`Failed to process digest ${digest.date}:`, e);
    }
  }

  // 3. Clear caches only for affected dates
  if (affectedDates.size > 0) {
    await Promise.all([
      env.CACHE.delete("api:dates"),
      ...[...affectedDates].flatMap((d) => [
        env.CACHE.delete(`page:${d}`),
        env.CACHE.delete(`api:highlights:${d}`),
      ]),
    ]);
  }

  return { fetched: items.length, new_digests: newCount, processed: processedCount };
}
