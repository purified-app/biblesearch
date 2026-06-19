import { Hono } from "hono";
import { serveStatic } from "hono/bun";
import { logger } from "hono/logger";
import { join } from "path";

import { apiRoutes } from "./api";

const app = new Hono();
app.use(logger());

app.route("/api", apiRoutes);

// Stably resolve the path to the client's build output
const clientDistPath = join(import.meta.dir, "../../client/dist/browser");

app.use("*", serveStatic({ root: clientDistPath }));

// Catch-all route to serve index.html for any unmatched routes (SPA routing)
app.get("*", serveStatic({ path: "index.html", root: clientDistPath }));

export default {
  port: process.env.PORT || 3000,
  fetch: app.fetch,
};
