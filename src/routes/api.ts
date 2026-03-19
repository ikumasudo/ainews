import { Hono } from "hono";
import type { Env } from "../types.ts";
import {
  getHighlightsByDate,
  getAvailableDates,
} from "../services/db.ts";

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

export default api;
