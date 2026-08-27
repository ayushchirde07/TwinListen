const express = require("express");
const next = require("next");
const { Server } = require("socket.io");
const { createServer } = require("http");

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = express();
  const httpServer = createServer(server);
  const io = new Server(httpServer);

  // Socket.io logic
  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    socket.on("join-room", (roomCode) => {
      socket.join(roomCode);
      console.log(`User ${socket.id} joined room ${roomCode}`);
      // Notify others in the room
      socket.to(roomCode).emit("user-joined", socket.id);
      
      // Get current clients in room
      const clients = io.sockets.adapter.rooms.get(roomCode);
      io.to(roomCode).emit("room-users", clients ? Array.from(clients) : []);
    });

    socket.on("play-audio", (roomCode) => {
      socket.to(roomCode).emit("play-audio");
    });

    socket.on("pause-audio", (roomCode) => {
      socket.to(roomCode).emit("pause-audio");
    });

    socket.on("sync-time", ({ roomCode, time }) => {
      socket.to(roomCode).emit("sync-time", time);
    });

    socket.on("disconnecting", () => {
      socket.rooms.forEach((room) => {
        if (room !== socket.id) {
          socket.to(room).emit("user-left", socket.id);
        }
      });
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });

  // Handle all Next.js routes
  server.all(/(.*)/, (req, res) => {
    return handle(req, res);
  });

  const PORT = process.env.PORT || 3000;
  httpServer.listen(PORT, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${PORT}`);
  });
});
