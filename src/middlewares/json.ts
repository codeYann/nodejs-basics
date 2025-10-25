import http from "node:http";

export async function json(
  req: http.IncomingMessage,
  res: http.ServerResponse
) {
  const buffer = [];

  try {
    for await (const chunk of req) {
      buffer.push(chunk);
    }

    (req as any).body = JSON.parse(Buffer.concat(buffer).toString());
  } catch (error) {
    (req as any).body = null;
  }

  res.setHeader("Content-type", "application/json");
}
