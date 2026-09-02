const express = require("express");
const next = require("next");
const { Server } = require("socket.io");
const { createServer } = require("http");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

// Ensure upload directory exists
const uploadDir = path.join(__dirname, "public", "audio");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// Multer storage: keep original extension, use roomCode as prefix
const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = `${req.body.roomCode || "room"}_${Date.now()}${ext}`;
    cb(null, name);
  },
});
const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } }); // 50 MB max

app.prepare().then(() => {
  const server = express();
  const httpServer = createServer(server);
  const io = new Server(httpServer);

  // Parse body for multer
  server.use(express.json());

  // Audio upload route — stores file and returns URL; client handles queue/broadcast
  server.post("/upload-audio", upload.single("audio"), (req, res) => {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    const fileName = req.file.filename;
    const songName = req.body.songName || req.file.originalname.replace(/\.[^/.]+$/, "");
    const audioUrl = `/audio/${fileName}`;
    res.json({ url: audioUrl, name: songName });
  });

  // Socket.io logic
  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    socket.on("join-room", (roomCode) => {
      socket.join(roomCode);
      console.log(`User ${socket.id} joined room ${roomCode}`);
      socket.to(roomCode).emit("user-joined", socket.id);
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

    // Broadcast a URL-based audio source (for Paste URL mode)
    socket.on("set-audio-url", ({ roomCode, url, name }) => {
      socket.to(roomCode).emit("set-audio-url", { url, name });
    });

    // Host broadcasts full queue to all listeners
    socket.on("queue-update", ({ roomCode, queue, currentIndex }) => {
      socket.to(roomCode).emit("queue-update", { queue, currentIndex });
    });

    // Host plays a specific song from queue (broadcasts to listeners)
    socket.on("play-queue-item", ({ roomCode, url, name, index }) => {
      socket.to(roomCode).emit("set-audio-url", { url, name });
      socket.to(roomCode).emit("queue-index", index);
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
