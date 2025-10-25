import http from "node:http";

type HttpMethod = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";

type Path = RegExp | string;

export interface Route {
  method: HttpMethod;
  path: Path;
  handler: (req: http.IncomingMessage, res: http.ServerResponse) => {};
}
