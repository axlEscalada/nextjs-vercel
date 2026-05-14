import { createServer, IncomingMessage, ServerResponse } from "node:http";

const PORT = process.env.PORT ?? 3001;

function readBody(req: IncomingMessage): Promise<unknown> {
  return new Promise((resolve) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => {
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString()));
      } catch {
        resolve(null);
      }
    });
  });
}

const server = createServer(async (req: IncomingMessage, res: ServerResponse) => {
  const body = await readBody(req);
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`, body ?? "");
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ ok: true }));
});

server.listen(PORT, () => {
  console.log(`logger service running on http://localhost:${PORT}`);
});
