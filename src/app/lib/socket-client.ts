import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export function getSocket(accessToken: string): Socket {
  if (socket?.connected) return socket;

  socket = io(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000", {
    path: "/api/socket",
    auth: { token: accessToken },  // passed to server middleware
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  socket.on("connect_error", (err) => {
    console.error("[Socket] connection error:", err.message);
  });

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}