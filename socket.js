import { Server } from "socket.io";

let io;

export function initSocket(server) {
  io = new Server(server, {
    cors: { origin: "*" },
  });

  io.on("connection", (socket) => {
    console.log("✅ connected:", socket.id);
  });
}

export function emitEvent(event, payload) {
  if (!io) throw new Error("Socket not initialized");
  io.emit(event, payload);
}
