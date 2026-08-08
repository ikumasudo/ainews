import { Hono } from "hono";
import pages from "./routes/pages.tsx";
import { processFeeds } from "./services/pipeline.ts";

const app = new Hono<{ Bindings: Env }>();

app.route("/", pages);

export default {
  fetch: app.fetch,

  async scheduled(
    _controller: ScheduledController,
    env: Env,
    _ctx: ExecutionContext
  ) {
    try {
      const result = await processFeeds(env);
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
} satisfies ExportedHandler<Env>;
