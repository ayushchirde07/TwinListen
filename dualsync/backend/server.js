const express = require("express");
const { Server } = require("socket.io");
const { createServer } = require("http");
const multer = require("multer");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

// ── Config ────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

// ── Upload directory ──────────────────────────────────────────────────────────
const uploadDir = path.join(__dirname, "public", "audio");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// ── Multer storage ─────────────────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = `${req.body.roomCode || "room"}_${Date.now()}${ext}`;
    cb(null, name);
  },
});
const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } }); // 50 MB

// ── Express app ───────────────────────────────────────────────────────────────
const app = express();
const httpServer = createServer(app);

// CORS — allow the Vercel frontend (and localhost for local dev)
const allowedOrigins = [
  FRONTEND_URL,
  "http://localhost:3000",
  "http://localhost:3001",
];

app.use(
  cors({
    origin: (origin, cb) => {
      // Allow requests with no origin (e.g. curl, Postman) and allowed origins
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      cb(new Error(`CORS blocked: ${origin}`));
    },
    credentials: true,
  })
);

app.use(express.json());

// Serve uploaded audio files as static assets
app.use("/audio", express.static(path.join(__dirname, "public", "audio")));

// Health check (Render uses this to confirm the service is up)
app.get("/health", (_req, res) => res.json({ status: "ok" }));

// ── Upload route ──────────────────────────────────────────────────────────────
// Client handles queue/broadcast — server just stores the file and returns URL
app.post("/upload-audio", upload.single("audio"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });
  const songName =
    req.body.songName || req.file.originalname.replace(/\.[^/.]+$/, "");
  const audioUrl = `/audio/${req.file.filename}`;
  res.json({ url: audioUrl, name: songName });
});

// ── Socket.io ─────────────────────────────────────────────────────────────────
const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("Connected:", socket.id);

  socket.on("join-room", (roomCode) => {
    socket.join(roomCode);
    console.log(`${socket.id} joined room ${roomCode}`);
    socket.to(roomCode).emit("user-joined", socket.id);
    const clients = io.sockets.adapter.rooms.get(roomCode);
    io.to(roomCode).emit("room-users", clients ? Array.from(clients) : []);
  });

  socket.on("play-audio", (roomCode) => socket.to(roomCode).emit("play-audio"));
  socket.on("pause-audio", (roomCode) => socket.to(roomCode).emit("pause-audio"));

  socket.on("sync-time", ({ roomCode, time }) =>
    socket.to(roomCode).emit("sync-time", time)
  );

  socket.on("set-audio-url", ({ roomCode, url, name }) =>
    socket.to(roomCode).emit("set-audio-url", { url, name })
  );

  // Queue events
  socket.on("queue-update", ({ roomCode, queue, currentIndex }) =>
    socket.to(roomCode).emit("queue-update", { queue, currentIndex })
  );

  socket.on("play-queue-item", ({ roomCode, url, name, index }) => {
    socket.to(roomCode).emit("set-audio-url", { url, name });
    socket.to(roomCode).emit("queue-index", index);
  });

  // Chat
  socket.on("chat-message", ({ roomCode, message }) =>
    io.to(roomCode).emit("chat-message", message)
  );

  // Cleanup on disconnect
  socket.on("disconnecting", () => {
    socket.rooms.forEach((room) => {
      if (room !== socket.id) socket.to(room).emit("user-left", socket.id);
    });
  });

  socket.on("disconnect", () => console.log("Disconnected:", socket.id));
});

// ── Start ─────────────────────────────────────────────────────────────────────
httpServer.listen(PORT, () => {
  console.log(`DualSync backend running on http://localhost:${PORT}`);
  console.log(`Accepting connections from: ${allowedOrigins.join(", ")}`);
});
