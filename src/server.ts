import http from "node:http";
import { logger } from "./logger.js";

const server = http.createServer((req, res) => {
  return res.end("Hello, World");
});

server.listen(3333, () => {
  logger.info(`Server running on localhost:${3333}`);
});
