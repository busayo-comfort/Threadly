"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../lib/api";
import { queryKeys } from "../lib/querykeys";

interface IUser {
  _id: string;
  username: string;
  email: string;
  avatar: string;
  isOnline: boolean;
  lastSeen: Date;
}

const fetchUsers = async (): Promise<IUser[]> => {
  const { data } = await axiosInstance.get("/users");
  if (!data.success) throw new Error("Failed to fetch users");
  return data.data;
};

const Users = () => {
  const router = useRouter();

  const {
    data: users = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: queryKeys.users,
    queryFn: fetchUsers,
    
  });

  const handleMessage = (userId: string) => {
    router.push(`/message/${userId}`);
  };

  if (isLoading) return <div className="p-4">Loading users...</div>;

  if (isError) {
    return (
      <div className="p-4 text-red-500">
        {error instanceof Error ? error.message : "Error fetching users"}
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Users</h1>
      {users.length === 0 ? (
        <p className="text-gray-500">No users found</p>
      ) : (
        <div className="grid gap-4">
          {users.map((user) => (
            <div
              key={user._id}
              className="border rounded-lg p-4 flex items-center justify-between hover:bg-gray-50"
            >
              <div className="flex items-center gap-4">
                {user.avatar && (
                  <img
                    src={user.avatar}
                    alt={user.username}
                    className="w-12 h-12 rounded-full"
                  />
                )}
                <div>
                  <p className="font-semibold">{user.username}</p>
                  <p className="text-sm text-gray-600">{user.email}</p>
                  <p className="text-xs">
                    {user.isOnline ? (
                      <span className="text-green-600">● Online</span>
                    ) : (
                      <span className="text-gray-400">
                        ● Last seen:{" "}
                        {new Date(user.lastSeen).toLocaleDateString()}
                      </span>
                    )}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleMessage(user._id)}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
              >
                Message
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Users;