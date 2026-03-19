import { Hono } from "hono";
import type { Env } from "./types.ts";
import pages from "./routes/pages.tsx";
import api from "./routes/api.ts";
import { processFeedsAndClearCache } from "./services/pipeline.ts";

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
    ctx.waitUntil(
      processFeedsAndClearCache(env).then((result) => {
        console.log(
          `Cron: Fetched ${result.fetched} items, ${result.new_digests} new, ${result.processed} processed`
        );
      })
    );
  },
};
