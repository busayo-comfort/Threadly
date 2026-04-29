import { Server as HTTPServer } from "http";
import { Server as SocketIOServer, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { connectDB, User, Message, Conversation } from "./db";

// Extend Socket type to carry our auth payload
interface AuthenticatedSocket extends Socket {
  userId?: string;
  username?: string;
}

let io: SocketIOServer;

export function initSocketServer(httpServer: HTTPServer) {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true,
    },
    path: "/api/socket",      // matches your Next.js /api/socket health route
  });

  // ── Auth middleware ──────────────────────────────────────────────────────────
  // Client must pass the accessToken in socket auth: { token }
  io.use(async (socket: AuthenticatedSocket, next) => {
    const token = socket.handshake.auth?.token as string | undefined;

    if (!token) {
      return next(new Error("Authentication error: no token"));
    }

    try {
      const secret = process.env.ACCESS_TOKEN_SECRET!;
      const payload = jwt.verify(token, secret) as { userId: string };
      socket.userId = payload.userId;

      await connectDB();
      const user = await User.findById(payload.userId).select("username");
      if (!user) return next(new Error("Authentication error: user not found"));

      socket.username = user.username;
      next();
    } catch {
      next(new Error("Authentication error: invalid token"));
    }
  });

  // ── Connection ───────────────────────────────────────────────────────────────
  io.on("connection", async (socket: AuthenticatedSocket) => {
    const userId = socket.userId!;
    console.log(`[Socket] ${socket.username} connected (${socket.id})`);

    // Mark online
    await User.findByIdAndUpdate(userId, { isOnline: true, lastSeen: new Date() });

    // Broadcast to everyone that this user is now online
    socket.broadcast.emit("user:online", { userId, isOnline: true });

    // Join a personal room so we can DM this socket directly
    socket.join(`user:${userId}`);

    // ── Join a conversation room ─────────────────────────────────────────────
    socket.on("conversation:join", async (conversationId: string) => {
      try {
        await connectDB();

        // Verify the user is actually a participant
        const convo = await Conversation.findOne({
          _id: conversationId,
          participants: userId,
        });

        if (!convo) {
          socket.emit("error", { message: "Conversation not found or access denied" });
          return;
        }

        socket.join(`conversation:${conversationId}`);
        socket.emit("conversation:joined", { conversationId });
      } catch (err) {
        console.error("[conversation:join]", err);
        socket.emit("error", { message: "Failed to join conversation" });
      }
    });

    // ── Leave a conversation room ────────────────────────────────────────────
    socket.on("conversation:leave", (conversationId: string) => {
      socket.leave(`conversation:${conversationId}`);
    });

    // ── Send a message ───────────────────────────────────────────────────────
    socket.on(
      "message:send",
      async (data: { conversationId: string; content: string }) => {
        const { conversationId, content } = data;

        if (!content?.trim()) {
          socket.emit("error", { message: "Message content cannot be empty" });
          return;
        }

        try {
          await connectDB();

          // Verify participant
          const convo = await Conversation.findOne({
            _id: conversationId,
            participants: userId,
          });

          if (!convo) {
            socket.emit("error", { message: "Conversation not found" });
            return;
          }

          // Save to DB
          const message = await Message.create({
            conversationId,
            sender: userId,
            content: content.trim(),
            readBy: [userId], // sender has already read it
          });

          // Update conversation's lastMessage
          await Conversation.findByIdAndUpdate(conversationId, {
            lastMessage: message._id,
            lastMessageAt: new Date(),
          });

          // Populate sender for the response
          const populated = await message.populate("sender", "username avatar");

          // Emit to everyone in the room (including sender)
          io.to(`conversation:${conversationId}`).emit("message:new", populated);
        } catch (err) {
          console.error("[message:send]", err);
          socket.emit("error", { message: "Failed to send message" });
        }
      }
    );

    // ── Typing indicators ────────────────────────────────────────────────────
    socket.on("typing:start", (conversationId: string) => {
      socket.to(`conversation:${conversationId}`).emit("typing:start", {
        conversationId,
        userId,
        username: socket.username,
      });
    });

    socket.on("typing:stop", (conversationId: string) => {
      socket.to(`conversation:${conversationId}`).emit("typing:stop", {
        conversationId,
        userId,
      });
    });

    // ── Mark messages as read ────────────────────────────────────────────────
    socket.on("message:read", async (conversationId: string) => {
      try {
        await connectDB();

        await Message.updateMany(
          {
            conversationId,
            readBy: { $ne: userId },
          },
          { $addToSet: { readBy: userId } }
        );

        // Tell other participants their messages were read
        socket.to(`conversation:${conversationId}`).emit("message:read", {
          conversationId,
          readBy: userId,
        });
      } catch (err) {
        console.error("[message:read]", err);
      }
    });

    // ── Disconnect ───────────────────────────────────────────────────────────
    socket.on("disconnect", async () => {
      console.log(`[Socket] ${socket.username} disconnected`);

      await User.findByIdAndUpdate(userId, {
        isOnline: false,
        lastSeen: new Date(),
      });

      socket.broadcast.emit("user:offline", {
        userId,
        lastSeen: new Date(),
      });
    });
  });

  return io;
}

// Export so API routes can emit events server-side if needed
export function getIO() {
  if (!io) throw new Error("Socket.io not initialized");
  return io;
}