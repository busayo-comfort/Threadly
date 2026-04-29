"use client";

import React, { useEffect, useState } from "react";

interface IUser {
  _id: string;
  username: string;
  email: string;
  avatar: string;
  isOnline: boolean;
  lastSeen: Date;
}

const Users = () => {
  const [users, setUsers] = useState<IUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("/api/users");
        const data = await response.json();

        if (data.success) {
          setUsers(data.data);
        } else {
          setError("Failed to fetch users");
        }
      } catch (err) {
        setError("Error fetching users");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleMessage = (userId: string, username: string) => {
    console.log(`Message button clicked for user: ${username} (${userId})`);
    // TODO: Implement message functionality (redirect to chat or open message modal)
  };

  if (loading) return <div className="p-4">Loading users...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

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
                  <p className="text-xs text-gray-500">
                    {user.isOnline ? (
                      <span className="text-green-600">● Online</span>
                    ) : (
                      <span className="text-gray-400">
                        ● Last seen: {new Date(user.lastSeen).toLocaleDateString()}
                      </span>
                    )}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleMessage(user._id, user.username)}
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