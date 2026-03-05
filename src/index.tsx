import { Hono } from "hono";
import type { Env } from "./types.ts";
import pages from "./routes/pages.tsx";
import api from "./routes/api.ts";
import { fetchRSSFeed, normalizeDate } from "./services/rss.ts";
import {
  saveDigest,
  saveHighlights,
  getUnprocessedDigests,
  getAvailableDates,
} from "./services/db.ts";
import { extractHighlights } from "./services/ai.ts";

const app = new Hono<{ Bindings: Env }>();

// API routes
app.route("/api", api);

// SSR pages
app.route("/", pages);

export default {
  fetch: app.fetch,

  async scheduled(
    controller: ScheduledController,
    env: Env,
    ctx: ExecutionContext
  ) {
    ctx.waitUntil(processFeeds(env));
  },
};

async function processFeeds(env: Env): Promise<void> {
  console.log("Cron: Starting RSS fetch...");

  // 1. Fetch and save new RSS items
  const items = await fetchRSSFeed();
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
    }
  }
  console.log(`Cron: Fetched ${items.length} items, ${newCount} new`);

  // 2. Process unprocessed digests with AI
  const unprocessed = await getUnprocessedDigests(env.DB);
  for (const digest of unprocessed) {
    try {
      const highlights = await extractHighlights(env.OPENROUTER_API_KEY, digest.raw_content);
      await saveHighlights(env.DB, digest.id, highlights);
      console.log(
        `Cron: Processed ${digest.date} → ${highlights.length} highlights`
      );
    } catch (e) {
      console.error(`Cron: Failed to process ${digest.date}:`, e);
    }
  }

  // 3. Clear caches
  const dates = await getAvailableDates(env.DB);
  await Promise.all([
    env.CACHE.delete("api:dates"),
    ...dates.map((d) =>
      Promise.all([
        env.CACHE.delete(`page:${d}`),
        env.CACHE.delete(`api:highlights:${d}`),
      ])
    ),
  ]);

  console.log("Cron: Done");
}
