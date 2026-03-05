import { Hono } from "hono";
import type { Env } from "../types.ts";
import { Layout } from "../components/Layout.tsx";
import { HighlightCard } from "../components/HighlightCard.tsx";
import { DateNav } from "../components/DateNav.tsx";
import { CategoryFilter } from "../components/CategoryFilter.tsx";
import {
  getHighlightsByDate,
  getAvailableDates,
  getLatestDate,
  getDigestByDate,
} from "../services/db.ts";

const pages = new Hono<{ Bindings: Env }>();

// Top page - show latest date
pages.get("/", async (c) => {
  const latestDate = await getLatestDate(c.env.DB);
  if (!latestDate) {
    return c.html(
      <Layout>
        <div class="text-center py-20">
          <p class="text-2xl text-slate-400 mb-4">📭</p>
          <p class="text-slate-400">まだデータがありません</p>
          <p class="text-slate-500 text-sm mt-2">
            Cron Triggerが実行されるか、手動でフェッチしてください
          </p>
        </div>
      </Layout>
    );
  }
  return c.redirect(`/${latestDate}`);
});

// Date-specific page
pages.get("/:date{\\d{4}-\\d{2}-\\d{2}}", async (c) => {
  const date = c.req.param("date");
  const db = c.env.DB;
  const cache = c.env.CACHE;

  // Check KV cache
  const cacheKey = `page:${date}`;
  const cached = await cache.get(cacheKey);
  if (cached) {
    return c.html(cached);
  }

  const [highlights, dates, digest] = await Promise.all([
    getHighlightsByDate(db, date),
    getAvailableDates(db),
    getDigestByDate(db, date),
  ]);

  if (highlights.length === 0) {
    return c.html(
      <Layout title={date}>
        <DateNav dates={dates} currentDate={date} />
        <div class="text-center py-20">
          <p class="text-2xl text-slate-400 mb-4">📭</p>
          <p class="text-slate-400">{date} のハイライトはありません</p>
        </div>
      </Layout>
    );
  }

  const highCount = highlights.filter((h) => h.importance === "high").length;

  const html = (
    <Layout title={date}>
      <DateNav dates={dates} currentDate={date} />

      <div class="mb-6">
        <h1 class="text-2xl font-bold text-white mb-1">{date} のハイライト</h1>
        <p class="text-slate-400 text-sm">
          {highlights.length}件のニュース（重要: {highCount}件）
          {digest && (
            <span>
              {" "}|{" "}
              <a
                href={digest.link}
                class="text-accent-blue hover:underline"
                target="_blank"
                rel="noopener"
              >
                元記事を読む ↗
              </a>
            </span>
          )}
        </p>
      </div>

      <CategoryFilter />

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        {highlights.map((h) => (
          <HighlightCard key={h.id} highlight={h} />
        ))}
      </div>
    </Layout>
  );

  // Cache rendered page (1 hour)
  const htmlString = html.toString();
  c.executionCtx.waitUntil(cache.put(cacheKey, htmlString, { expirationTtl: 3600 }));

  return c.html(html);
});

export default pages;
