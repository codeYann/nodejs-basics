import http from "node:http";
import { logger } from "./logger.js";
import { json } from "./middlewares/json.js";
import type { User } from "./entitties/User.js";

const users: User[] = [];

const server = http.createServer(async (req, res) => {
  const { method, url } = req;

  await json(req, res);

  if (method === "GET" && url === "/users") {
    return res.end(JSON.stringify(users));
  }

  if (method === "POST" && url === "/users") {
    const { name, email } = (req as any).body;

    users.push({
      id: 1,
      name: String(name),
      email: String(email),
    });

    return res.writeHead(201).end();
  }

  return res.writeHead(404).end();
});

server.listen(3333, () => {
  logger.info(`Server running on localhost:${3333}`);
});
