"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/app/lib/api";
import { queryKeys } from "@/app/lib/querykeys";
import MessagePanel from "../message/[id]";

interface Contact {
  _id: string;
  username: string;
  avatar: string;
  isOnline: boolean;
  lastSeen: string;
}

interface SearchUser {
  _id: string;
  username: string;
  email: string;
  avatar: string;
  isOnline: boolean;
}

const ChatPage = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  // ── Contacts (existing conversations) ────────────────────────────────────
  const { data: contacts = [], isLoading: contactsLoading } = useQuery({
    queryKey: queryKeys.contacts(),
    queryFn: async () => {
      const { data } = await axiosInstance.get("/conversations/contacts");
      return data.contacts as Contact[];
    },
  });

  // ── Search new users ──────────────────────────────────────────────────────
  const { data: searchResults = [], isLoading: searchLoading } = useQuery({
    queryKey: ["users", "search", searchQuery],
    queryFn: async () => {
      const { data } = await axiosInstance.get(`/users/search?q=${encodeURIComponent(searchQuery)}`);
      return data.users as SearchUser[];
    },
    enabled: searchQuery.length >= 2,
  });

  const handleLogout = async () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userId");
    try { await axiosInstance.post("/auth/logout"); } catch {}
    queryClient.clear();
    router.push("/login");
  };

  const selectedContact = contacts.find((c) => c._id === selectedUserId);

  return (
    <div className="flex h-screen bg-white overflow-hidden">

      {/* ── Left sidebar ─────────────────────────────────────────────────── */}
      <div className="w-80 shrink-0 border-r border-gray-200 flex flex-col">

        {/* Sidebar header */}
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-black rounded-md flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-3.5 h-3.5">
                <path d="M4.913 2.658c2.075-.27 4.19-.408 6.337-.408 2.147 0 4.262.139 6.337.408 1.922.25 3.291 1.861 3.405 3.727a4.403 4.403 0 00-1.032-.211 50.89 50.89 0 00-8.42 0c-2.358.196-4.04 2.19-4.04 4.434v4.286a4.47 4.47 0 002.433 3.984L7.28 21.53A.75.75 0 016 21v-4.03a48.527 48.527 0 01-1.087-.128C2.905 16.58 1.5 14.833 1.5 12.862V6.638c0-1.97 1.405-3.718 3.413-3.979z" />
                <path d="M15.75 7.5c-1.376 0-2.739.057-4.086.169C10.124 7.797 9 9.103 9 10.609v4.285c0 1.507 1.128 2.814 2.67 2.94 1.243.102 2.5.157 3.768.165l2.782 2.781a.75.75 0 001.28-.53v-2.39l.33-.026c1.542-.125 2.67-1.433 2.67-2.94v-4.286c0-1.505-1.125-2.811-2.664-2.94A49.392 49.392 0 0015.75 7.5z" />
              </svg>
            </div>
            <span className="font-bold text-sm">Threadly</span>
          </div>
          <button
            onClick={handleLogout}
            title="Logout"
            className="text-gray-400 hover:text-red-500 transition p-1 rounded-lg hover:bg-red-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M7.5 3.75A1.5 1.5 0 006 5.25v13.5a1.5 1.5 0 001.5 1.5h6a1.5 1.5 0 001.5-1.5V15a.75.75 0 011.5 0v3.75a3 3 0 01-3 3h-6a3 3 0 01-3-3V5.25a3 3 0 013-3h6a3 3 0 013 3V9A.75.75 0 0115 9V5.25a1.5 1.5 0 00-1.5-1.5h-6zm10.72 4.72a.75.75 0 011.06 0l3 3a.75.75 0 010 1.06l-3 3a.75.75 0 11-1.06-1.06l1.72-1.72H9a.75.75 0 010-1.5h10.94l-1.72-1.72a.75.75 0 010-1.06z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Search toggle */}
        <div className="px-4 py-3 border-b border-gray-100">
          <button
            onClick={() => { setShowSearch(!showSearch); setSearchQuery(""); }}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition ${
              showSearch ? "bg-black text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M10.5 3.75a6.75 6.75 0 100 13.5 6.75 6.75 0 000-13.5zM2.25 10.5a8.25 8.25 0 1114.59 5.28l4.69 4.69a.75.75 0 11-1.06 1.06l-4.69-4.69A8.25 8.25 0 012.25 10.5z" clipRule="evenodd" />
            </svg>
            {showSearch ? "Close search" : "Find people"}
          </button>

          {/* Search input */}
          {showSearch && (
            <div className="mt-2 relative">
              <input
                autoFocus
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by username…"
                className="w-full bg-gray-100 rounded-lg px-3 py-2 text-sm outline-none placeholder:text-gray-400 focus:ring-2 focus:ring-black/10 transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs hover:text-gray-600"
                >✕</button>
              )}
            </div>
          )}
        </div>

        {/* List area */}
        <div className="flex-1 overflow-y-auto py-2">

          {/* Search results */}
          {showSearch && searchQuery.length >= 2 && (
            <>
              {searchLoading && (
                <div className="flex justify-center py-8">
                  <span className="w-4 h-4 rounded-full border-2 border-gray-300 border-t-gray-600 animate-spin" />
                </div>
              )}
              {!searchLoading && searchResults.length === 0 && (
                <p className="text-center text-gray-400 text-xs py-8">No users found</p>
              )}
              {searchResults.map((user) => (
                <button
                  key={user._id}
                  onClick={() => { setSelectedUserId(user._id); setShowSearch(false); setSearchQuery(""); }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition text-left"
                >
                  <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-600 uppercase shrink-0">
                    {user.username[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{user.username}</p>
                    <p className="text-xs text-gray-400 truncate">{user.email}</p>
                  </div>
                  <span className={`text-[10px] shrink-0 ${user.isOnline ? "text-green-500" : "text-gray-300"}`}>●</span>
                </button>
              ))}
            </>
          )}

          {showSearch && searchQuery.length < 2 && (
            <p className="text-center text-gray-400 text-xs py-8">Type to search</p>
          )}

          {/* Contacts list */}
          {!showSearch && (
            <>
              <p className="px-4 py-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                Messages
              </p>

              {contactsLoading && (
                <div className="flex justify-center py-8">
                  <span className="w-4 h-4 rounded-full border-2 border-gray-300 border-t-gray-600 animate-spin" />
                </div>
              )}

              {!contactsLoading && contacts.length === 0 && (
                <div className="px-4 py-8 text-center">
                  <p className="text-gray-400 text-xs">No conversations yet</p>
                  <p className="text-gray-300 text-xs mt-1">Use search to find people</p>
                </div>
              )}

              {contacts.map((contact) => (
                <button
                  key={contact._id}
                  onClick={() => setSelectedUserId(contact._id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 transition text-left relative ${
                    selectedUserId === contact._id
                      ? "bg-gray-100"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <div className="relative shrink-0">
                    <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-600 uppercase">
                      {contact.avatar
                        ? <img src={contact.avatar} className="w-full h-full rounded-full object-cover" alt={contact.username} />
                        : contact.username[0]
                      }
                    </div>
                    {contact.isOnline && (
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{contact.username}</p>
                    <p className="text-xs text-gray-400 truncate">
                      {contact.isOnline ? "Online" : `Last seen ${new Date(contact.lastSeen).toLocaleDateString()}`}
                    </p>
                  </div>
                </button>
              ))}
            </>
          )}
        </div>
      </div>

      {/* ── Right panel ──────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        {selectedUserId ? (
          <MessagePanel key={selectedUserId} targetUserId={selectedUserId} />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 bg-gray-50">
            <div className="w-14 h-14 rounded-2xl bg-gray-200 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7 text-gray-400">
                <path d="M4.913 2.658c2.075-.27 4.19-.408 6.337-.408 2.147 0 4.262.139 6.337.408 1.922.25 3.291 1.861 3.405 3.727a4.403 4.403 0 00-1.032-.211 50.89 50.89 0 00-8.42 0c-2.358.196-4.04 2.19-4.04 4.434v4.286a4.47 4.47 0 002.433 3.984L7.28 21.53A.75.75 0 016 21v-4.03a48.527 48.527 0 01-1.087-.128C2.905 16.58 1.5 14.833 1.5 12.862V6.638c0-1.97 1.405-3.718 3.413-3.979z" />
                <path d="M15.75 7.5c-1.376 0-2.739.057-4.086.169C10.124 7.797 9 9.103 9 10.609v4.285c0 1.507 1.128 2.814 2.67 2.94 1.243.102 2.5.157 3.768.165l2.782 2.781a.75.75 0 001.28-.53v-2.39l.33-.026c1.542-.125 2.67-1.433 2.67-2.94v-4.286c0-1.505-1.125-2.811-2.664-2.94A49.392 49.392 0 0015.75 7.5z" />
              </svg>
            </div>
            <p className="text-gray-500 text-sm font-medium">Your messages will appear here</p>
            <p className="text-gray-400 text-xs">Select a contact or search for someone to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;