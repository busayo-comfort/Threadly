"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/app/lib/api";

interface IUser {
  _id: string;
  username: string;
  email: string;
  avatar: string;
  isOnline: boolean;
  lastSeen: Date;
}

const searchUsers = async (query: string): Promise<IUser[]> => {
  if (query.length < 2) return [];
  const { data } = await axiosInstance.get(`/users/search?q=${encodeURIComponent(query)}`);
  return data.users ?? [];
};

const Users = () => {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const isValid = query.length >= 2;

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["users", "search", query],
    queryFn: () => searchUsers(query),
    enabled: query.length >= 2,   // only search after 2 chars
  });

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-xl font-bold mb-4">New Message</h1>

      {/* Search input */}
      <div className="relative mb-6">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by username or email…"
          className="w-full bg-gray-100 rounded-full px-4 py-2.5 text-sm outline-none placeholder:text-gray-400 focus:ring-2 focus:ring-black/10 transition"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        )}
      </div>

      {/* States */}
      {query.length < 2 && (
        <p className="text-center text-gray-400 text-sm mt-12">
          Type at least 2 characters to search for people
        </p>
      )}

      {isValid && isLoading && (
        <div className="flex justify-center mt-12">
          <span className="w-5 h-5 rounded-full border-2 border-gray-300 border-t-gray-600 animate-spin" />
        </div>
      )}

      {isValid && !isLoading && users.length === 0 && (
        <p className="text-center text-gray-400 text-sm mt-12">
          No users found for "{query}"
        </p>
      )}

      {/* Results */}
      <div className="flex flex-col gap-2">
        {users.map((user) => (
          <div
            key={user._id}
            className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-200 transition"
          >
            <div className="flex items-center gap-3">
              {/* Avatar */}
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-semibold text-gray-600 uppercase shrink-0">
                {user.avatar
                  ? <img src={user.avatar} className="w-full h-full rounded-full object-cover" />
                  : user.username[0]
                }
              </div>

              <div>
                <p className="text-sm font-semibold">{user.username}</p>
                <p className="text-xs text-gray-400">{user.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Online badge */}
              <span className={`text-xs ${user.isOnline ? "text-green-500" : "text-gray-400"}`}>
                {user.isOnline ? "● Online" : "● Offline"}
              </span>

              {/* Message button */}
              <button
                onClick={() => router.push(`/message/${user._id}`)}
                className="text-xs bg-black text-white px-3 py-1.5 rounded-full hover:bg-gray-800 transition"
              >
                Message
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Users;