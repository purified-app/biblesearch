import { Hono } from "hono";
import { serveStatic } from "hono/bun";
import { logger } from "hono/logger";

import { apiRoutes } from "./api";

const app = new Hono();
app.use(logger());

app.route("/api", apiRoutes);

app.use("*", serveStatic({ root: "../client/dist/browser" }));
// Catch-all route to serve index.html for any unmatched routes
app.get("*", serveStatic({ path: "index.html", root: "../client/dist/browser" }));

export default {
  fetch: app.fetch,
};
