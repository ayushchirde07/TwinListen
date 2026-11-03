const express = require("express");
const { Server } = require("socket.io");
const { createServer } = require("http");
const multer = require("multer");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const ytdl = require("@distube/ytdl-core");

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

// ── YouTube endpoints ─────────────────────────────────────────────────────────
// Returns video title for a YouTube URL
app.get("/youtube-info", async (req, res) => {
  try {
    const url = decodeURIComponent(req.query.url || "");
    if (!ytdl.validateURL(url)) {
      return res.status(400).json({ error: "Invalid YouTube URL" });
    }
    const info = await ytdl.getInfo(url);
    res.json({ title: info.videoDetails.title });
  } catch (err) {
    console.error("YouTube info error:", err.message);
    res.status(500).json({ error: "Could not fetch YouTube info. The video may be private or age-restricted." });
  }
});

// Streams YouTube audio — supports Range requests so seeking works
app.get("/youtube-stream", async (req, res) => {
  try {
    const url = decodeURIComponent(req.query.url || "");
    if (!ytdl.validateURL(url)) {
      return res.status(400).json({ error: "Invalid YouTube URL" });
    }
    const info = await ytdl.getInfo(url);
    const format = ytdl.chooseFormat(info.formats, {
      filter: "audioonly",
      quality: "highestaudio",
    });

    // Proxy YouTube CDN with Range support so the seek bar works
    const fetchHeaders = { "User-Agent": "Mozilla/5.0" };
    if (req.headers.range) fetchHeaders["Range"] = req.headers.range;

    const ytRes = await fetch(format.url, { headers: fetchHeaders });
    res.status(ytRes.status);
    res.setHeader("Content-Type", format.mimeType || "audio/webm");
    res.setHeader("Accept-Ranges", "bytes");
    if (ytRes.headers.get("content-length"))
      res.setHeader("Content-Length", ytRes.headers.get("content-length"));
    if (ytRes.headers.get("content-range"))
      res.setHeader("Content-Range", ytRes.headers.get("content-range"));

    ytRes.body.pipe(res);
  } catch (err) {
    console.error("YouTube stream error:", err.message);
    if (!res.headersSent) res.status(500).end();
  }
});

// ── Download proxy endpoint ────────────────────────────────────────────────────
// Fetches any audio URL (uploaded file or YouTube stream) and serves it as a
// downloadable attachment so the browser triggers a native Save dialog.
// Query params: url (encoded), name (optional filename for the download)
app.get("/download-audio", async (req, res) => {
  try {
    const rawUrl = decodeURIComponent(req.query.url || "");
    const name = decodeURIComponent(req.query.name || "audio");
    if (!rawUrl) return res.status(400).json({ error: "Missing url param" });

    // For uploaded files served from our own /audio/ path, read from disk directly
    const isLocal = rawUrl.includes("/audio/") && !rawUrl.includes("youtube");
    if (isLocal) {
      const filename = path.basename(rawUrl.split("?")[0]);
      const filePath = path.join(__dirname, "public", "audio", filename);
      if (!fs.existsSync(filePath)) return res.status(404).json({ error: "File not found" });
      const ext = path.extname(filename) || ".mp3";
      const safeName = name.replace(/[^\w\s.-]/g, "_") + ext;
      res.setHeader("Content-Disposition", `attachment; filename="${safeName}"`);
      res.setHeader("Content-Type", "audio/mpeg");
      res.setHeader("Access-Control-Expose-Headers", "Content-Disposition");
      return fs.createReadStream(filePath).pipe(res);
    }

    // For YouTube streams or external URLs, proxy-fetch and forward as attachment
    const proxyRes = await fetch(rawUrl, { headers: { "User-Agent": "Mozilla/5.0" } });
    if (!proxyRes.ok) return res.status(502).json({ error: "Could not fetch audio" });

    const contentType = proxyRes.headers.get("content-type") || "audio/mpeg";
    const ext = contentType.includes("webm") ? ".webm" : contentType.includes("mp4") ? ".m4a" : ".mp3";
    const safeName = name.replace(/[^\w\s.-]/g, "_") + ext;

    res.setHeader("Content-Disposition", `attachment; filename="${safeName}"`);
    res.setHeader("Content-Type", contentType);
    res.setHeader("Access-Control-Expose-Headers", "Content-Disposition");
    if (proxyRes.headers.get("content-length"))
      res.setHeader("Content-Length", proxyRes.headers.get("content-length"));

    proxyRes.body.pipe(res);
  } catch (err) {
    console.error("Download proxy error:", err.message);
    if (!res.headersSent) res.status(500).json({ error: "Download failed" });
  }
});


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

  // Download permissions — host broadcasts allow/deny to all members
  socket.on("download-permission", ({ roomCode, allowed }) =>
    socket.to(roomCode).emit("download-permission", { allowed })
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
