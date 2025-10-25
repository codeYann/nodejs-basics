import { randomUUID } from "node:crypto";
import http from "node:http";
import type { User } from "../entitties/User.js";
import type { Route } from "./types/Route.js";
import { database } from "../database/index.js";
import { buildRoutePath } from "../shared/build-route-path.js";

export const userRoutes = [
  {
    method: "GET",
    path: "/users",
    handler: (_: http.IncomingMessage, res: http.ServerResponse) => {
      const users = database.select("users");
      return res.end(JSON.stringify(users));
    },
  },
  {
    method: "POST",
    path: "/users",
    handler: (req: http.IncomingMessage, res: http.ServerResponse) => {
      const { name, email } = (req as any).body;

      const user = {
        id: randomUUID(),
        name: String(name),
        email: String(email),
      } as User;

      database.insert("users", user);
      return res.writeHead(201).end();
    },
  },
  {
    method: "DELETE",
    path: "/users/:id",
    handler: (req: http.IncomingMessage, res: http.ServerResponse) => {
      // TODO: Implement the DELETE route
      res.end();
    },
  },
].map((route) => ({
  ...route,
  path: buildRoutePath(route?.path),
})) as Route[];
