import http from "node:http";
import { logger } from "./logger.js";
import { json } from "./middlewares/json.js";
import { routes } from "./routes/routes.js";
import { extractQueryParams } from "./shared/extract-query-params.js";

const server = http.createServer(async (req, res) => {
  const { method, url } = req;

  // Skip JSON middleware for multipart/form-data
  const isMultipart = req.headers["content-type"]?.includes("multipart/form-data");
  if (!isMultipart) {
    await json(req, res);
  }

  const route = routes.find(
    (route) =>
      route.method === method && new RegExp(route.path).test(String(url))
  );

  if (route) {
    const routeParams = req.url?.match(route.path);
    const groups = routeParams?.groups;

    let query: string | undefined;
    let params: Record<string, string> = {};

    if (groups) {
      const mutableGroups = { ...groups };
      if ("query" in mutableGroups) {
        query = mutableGroups.query;
        delete mutableGroups.query;
      }
      params = mutableGroups;
    }

    (req as any).params = params;
    (req as any).query = query ? extractQueryParams(query) : {};

    return route.handler(req, res);
  }

  return res.writeHead(404).end();
});

server.listen(3333, () => {
  logger.info(`Server running on localhost:${3333}`);
});
