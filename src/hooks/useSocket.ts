"use client";

import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const useSocket = () => {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!socket) {
      socket = io("http://localhost:4000", {
        withCredentials: true,
      });
    }

    socket.on("connect", () => {
      console.log("✅ Connected:", socket?.id);
      setIsConnected(true);
    });

    socket.on("disconnect", () => {
      console.log("❌ Disconnected");
      setIsConnected(false);
    });

    return () => {
      socket?.disconnect();
      socket = null;
    };
  }, []);

  const joinRoom = (room: string) => {
    socket?.emit("join_room", room);
  };

  const sendMessage = (data: any) => {
    socket?.emit("send_message", data);
  };

  const onReceiveMessage = (callback: (data: any) => void) => {
    socket?.on("receive_message", callback);
  };

  return {
    socket,
    isConnected,
    joinRoom,
    sendMessage,
    onReceiveMessage,
  };
};