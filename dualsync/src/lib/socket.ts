import { io } from "socket.io-client";

// In production: set NEXT_PUBLIC_SOCKET_URL to your Render backend URL
// e.g. https://dualsync-backend.onrender.com
const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001";

export const socket = io(SOCKET_URL, {
  autoConnect: false, // Connect manually when user enters the sync room
});
