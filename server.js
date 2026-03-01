import express from "express";
import http from "http";
import { initSocket, emitEvent } from "./socket.js";

const app = express();
app.use(express.json());

const server = http.createServer(app);
initSocket(server);

app.post("/emit", (req, res) => {
  const { event, payload } = req.body;
  console.log("event" , event)
  console.log("payload" , payload)
  emitEvent(event, payload);
  res.json({ ok: true });
});

server.listen(4000, () => {
  console.log("🚀 Socket server on 4000");
});