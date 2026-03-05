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
        <div class="text-center py-24">
          <p class="font-display text-lg text-sub dark:text-sub-dark italic">
            &mdash; まだデータがありません &mdash;
          </p>
          <p class="font-body text-sub dark:text-sub-dark text-sm mt-3">
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
        <div class="text-center py-24">
          <p class="font-display text-lg text-sub dark:text-sub-dark italic">
            &mdash; {date} のハイライトはありません &mdash;
          </p>
        </div>
      </Layout>
    );
  }

  const highCount = highlights.filter((h) => h.importance === "high").length;

  const html = (
    <Layout title={date}>
      <DateNav dates={dates} currentDate={date} />

      <div class="flex items-baseline justify-between mb-6">
        <p class="font-body text-xs text-sub dark:text-sub-dark tracking-wide">
          {highlights.length}件 &mdash; 重要 {highCount}件
        </p>
        {digest && (
          <a
            href={digest.link}
            class="font-body text-xs text-sub dark:text-sub-dark hover:text-accent dark:hover:text-accent-dark transition-colors"
            target="_blank"
            rel="noopener"
          >
            元記事を読む &rarr;
          </a>
        )}
      </div>

      <CategoryFilter />

      <div class="grid grid-cols-1 gap-0">
        {highlights.map((h, i) => (
          <HighlightCard key={h.id} highlight={h} index={i} />
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
