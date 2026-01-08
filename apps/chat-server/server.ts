import http from "node:http";
import { WebSocketServer, type WebSocket } from "ws";

const port = Number(process.env.PORT) || 8080;

const server = http.createServer((req, res) => {
  if (req.url === "/health") {
    res.writeHead(200);
    res.end("OK");
    return;
  }
  res.writeHead(404);
  res.end();
});

const wss = new WebSocketServer({ server });

wss.on("connection", (ws: WebSocket) => {
  ws.send(JSON.stringify({ type: "connected" }));
  ws.on("message", (data) => {
    console.log(`Received message: ${data.toString()}`);
    ws.send(data.toString());
  });
});

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
