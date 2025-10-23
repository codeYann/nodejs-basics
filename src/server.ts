import http from "node:http";
import { logger } from "./logger.js";

interface User {
  id: number;
  name: string;
  email: string;
}

const users: User[] = [];

async function readAndAttachJsonBody(req: http.IncomingMessage) {
  const buffer = [];

  try {
    for await (const chunk of req) {
      buffer.push(chunk);
    }

    (req as any).body = JSON.parse(Buffer.concat(buffer).toString());
  } catch (error) {
    (req as any).body = null;
  }
}

const server = http.createServer(async (req, res) => {
  const { method, url } = req;

  await readAndAttachJsonBody(req);

  if (method === "GET" && url === "/users") {
    return res
      .setHeader("Content-type", "application/json")
      .end(JSON.stringify(users));
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
