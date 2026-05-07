"use client";

import { useEffect, useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { io, Socket } from "socket.io-client";
import axiosInstance from "@/app/lib/api";
import { queryKeys } from "@/app/lib/querykeys";

interface Message {
  _id: string;
  sender: { _id: string; username: string };
  content: string;
  createdAt: string;
}

interface Conversation {
  _id: string;
  participants: { _id: string; username: string; avatar: string; isOnline: boolean }[];
}

const getOrCreateConversation = async (targetUserId: string): Promise<Conversation> => {
  const { data } = await axiosInstance.post("/conversations", { targetUserId });
  return data.conversation;
};

const fetchMessages = async (conversationId: string): Promise<Message[]> => {
  const { data } = await axiosInstance.get(`/conversations/${conversationId}/messages`);
  return data.messages ?? [];
};

const MessagePanel = ({ targetUserId }: { targetUserId: string }) => {
  const queryClient = useQueryClient();
  const socketRef = useRef<Socket | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const typingTimer = useRef<NodeJS.Timeout | null>(null);

  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [socketReady, setSocketReady] = useState(false);

  const currentUserId = typeof window !== "undefined" ? localStorage.getItem("userId") : null;
  const accessToken = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

  const {
    data: conversation,
    isPending: conversationLoading,
    isError: conversationError,
    mutate: initConversation,
  } = useMutation({
    mutationFn: () => getOrCreateConversation(targetUserId),
  });

  // Re-run when targetUserId changes (user clicks different contact)
  useEffect(() => {
    if (targetUserId) {
      setSocketReady(false);
      setInput("");
      initConversation();
    }
  }, [targetUserId]);

  const conversationId = conversation?._id;

  const { data: messages = [], isLoading: messagesLoading } = useQuery({
    queryKey: queryKeys.messages(conversationId!),
    queryFn: () => fetchMessages(conversationId!),
    enabled: !!conversationId,
  });

  useEffect(() => {
    if (!conversationId || !accessToken) return;

    const socket = io(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000", {
      path: "/socket.io",
      auth: { token: accessToken },
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("conversation:join", conversationId);
      socket.emit("message:read", conversationId);
      setSocketReady(true);
    });

    socket.on("message:new", (msg: Message) => {
      queryClient.setQueryData<Message[]>(
        queryKeys.messages(conversationId),
        (prev = []) => {
          const withoutOptimistic = prev.filter(
            (m) => !(m._id.startsWith("temp-") && m.sender._id === currentUserId)
          );
          const alreadyExists = withoutOptimistic.some((m) => m._id === msg._id);
          return alreadyExists ? withoutOptimistic : [...withoutOptimistic, msg];
        }
      );
      socket.emit("message:read", conversationId);
    });

    socket.on("typing:start", ({ userId }: { userId: string }) => {
      if (userId !== currentUserId) setIsTyping(true);
    });

    socket.on("typing:stop", ({ userId }: { userId: string }) => {
      if (userId !== currentUserId) setIsTyping(false);
    });

    return () => {
      socket.emit("conversation:leave", conversationId);
      socket.disconnect();
      socketRef.current = null;
      setSocketReady(false);
    };
  }, [conversationId, accessToken, currentUserId, queryClient]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim() || !socketRef.current || !conversationId || !currentUserId) return;
    const content = input.trim();

    const optimisticMessage: Message = {
      _id: `temp-${Date.now()}`,
      sender: { _id: currentUserId, username: "You" },
      content,
      createdAt: new Date().toISOString(),
    };

    queryClient.setQueryData<Message[]>(
      queryKeys.messages(conversationId),
      (prev = []) => [...prev, optimisticMessage]
    );

    socketRef.current.emit("message:send", { conversationId, content });
    if (typingTimer.current) clearTimeout(typingTimer.current);
    socketRef.current.emit("typing:stop", conversationId);
    setInput("");
  };

  const handleInputChange = (value: string) => {
    setInput(value);
    if (!socketRef.current || !conversationId) return;
    socketRef.current.emit("typing:start", conversationId);
    if (typingTimer.current) clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      socketRef.current?.emit("typing:stop", conversationId);
    }, 1500);
  };

  const otherParticipant = conversation?.participants.find((p) => p._id !== currentUserId);

  if (conversationError) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-red-400 text-sm">Failed to load conversation.</p>
      </div>
    );
  }

  if (conversationLoading || messagesLoading || !socketReady) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex items-center gap-2 text-gray-400 text-sm">
          <span className="w-4 h-4 rounded-full border-2 border-gray-300 border-t-gray-600 animate-spin" />
          Connecting…
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-200 bg-white shrink-0">
        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-600 uppercase shrink-0">
          {otherParticipant?.username?.[0] ?? "?"}
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold leading-tight">
            {otherParticipant?.username ?? "Conversation"}
          </span>
          <span className={`text-xs ${otherParticipant?.isOnline ? "text-green-500" : "text-gray-400"}`}>
            {otherParticipant?.isOnline ? "Online" : "Offline"}
          </span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-2 bg-gray-50">
        {messages.length === 0 && (
          <p className="text-center text-gray-400 text-xs mt-8">No messages yet. Say hi! 👋</p>
        )}
        {messages.map((msg) => {
          const isMine = msg.sender._id === currentUserId;
          return (
            <div key={msg._id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[65%] px-3 py-2 rounded-2xl text-sm leading-snug ${
                isMine
                  ? "bg-black text-white rounded-br-sm"
                  : "bg-white text-gray-900 border border-gray-200 rounded-bl-sm"
              }`}>
                {!isMine && (
                  <p className="text-[10px] text-gray-400 mb-1">{msg.sender.username}</p>
                )}
                {msg.content}
                <p className="text-[10px] mt-1 text-right text-gray-400">
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          );
        })}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-sm px-4 py-2 flex gap-1 items-center">
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]" />
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]" />
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-5 py-3 border-t border-gray-200 bg-white flex items-center gap-2 shrink-0">
        <input
          className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm outline-none placeholder:text-gray-400 focus:ring-2 focus:ring-black/10 transition"
          value={input}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Type a message…"
        />
        <button
          onClick={sendMessage}
          disabled={!input.trim()}
          className="w-9 h-9 rounded-full bg-black text-white flex items-center justify-center shrink-0 disabled:opacity-30 hover:bg-gray-800 transition"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 translate-x-px">
            <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default MessagePanel;