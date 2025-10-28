import { randomUUID } from "node:crypto";
import { IncomingMessage, ServerResponse } from "node:http";
import type { Task } from "../entitties/Task.js";
import type { Route } from "./types/Route.js";
import { database } from "../database/index.js";
import { buildRoutePath } from "../shared/build-route-path.js";
import { createMultipartFilter } from "../shared/create-multipart-filter.js";
import csvParser from "csv-parser";
import { logger } from "../logger.js";

export const taskRoutes = [
  {
    method: "GET",
    path: "/tasks",
    handler: (req: IncomingMessage, res: ServerResponse) => {
      const tasks = database.select("tasks");
      return res.end(JSON.stringify(tasks));
    },
  },
  {
    method: "POST",
    path: "/tasks",
    handler: async (req: IncomingMessage, res: ServerResponse) => {
      try {
        const contentType = req.headers["content-type"];
        const boundaryMatch = contentType?.match(/boundary=([^\r\n]+)/);
        const boundary = boundaryMatch?.[1];

        if (!boundary) {
          return res
            .writeHead(400, { "Content-Type": "application/json" })
            .end(
              JSON.stringify({ error: "No boundary found in Content-Type" })
            );
        }

        let stream = req.pipe(createMultipartFilter(boundary));
        const parser = stream.pipe(csvParser());

        const tasks: Task[] = [];

        for await (const row of parser) {
          // Map CSV row to Task entity
          const task: Task = {
            id: randomUUID(),
            title: row.title,
            description: row.description || undefined,
            status: "todo",
            createdAt: new Date(),
            userId: row.userId || "",
            ...(row.dueDate && { dueDate: new Date(row.dueDate) }),
          };
          tasks.push(task);
          await database.insert("tasks", task);
        }

        res
          .writeHead(201, { "Content-Type": "application/json" })
          .end(JSON.stringify({ message: `${tasks.length} tasks created` }));
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        logger.error("Error processing CSV: " + errorMessage);
        res
          .writeHead(400, { "Content-Type": "application/json" })
          .end(JSON.stringify({ error: errorMessage }));
      }
    },
  },
].map((route) => ({
  ...route,
  path: buildRoutePath(route?.path),
})) as Route[];
