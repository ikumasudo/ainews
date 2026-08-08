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
    _controller: ScheduledController,
    env: Env,
    _ctx: ExecutionContext
  ) {
    try {
      const result = await processFeedsAndClearCache(env);
      console.log(JSON.stringify({ event: "cron.completed", ...result }));
    } catch (error) {
      console.error(
        JSON.stringify({
          event: "cron.failed",
          error: error instanceof Error ? error.message : String(error),
        })
      );
      throw error;
    }
  },
};
