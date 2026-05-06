"use client";

import React, { useRef, useEffect } from 'react'
import axiosInstance from '../lib/api';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Socket } from 'socket.io-client';
import { queryKeys } from '../lib/querykeys';

interface Contact {
  _id: string;
  username: string;
  avatar: string;
  isOnline: boolean;
  lastSeen: string;
}

const MyContacts = () => {
  const router = useRouter();
  const socketRef = useRef<Socket | null>(null);
  const queryClient = useQueryClient();

  const { data: contactsData, isLoading, error } = useQuery({
    queryKey: queryKeys.contacts(),
    queryFn: async () => {
      const { data } = await axiosInstance.get('/conversations/contacts');
      return data.contacts as Contact[];
    },
  });

  const handleLogout = async () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userId");

    try {
      await axiosInstance.post("/auth/logout");
    } catch {
      // Continue logout even if API call fails
    }
    queryClient.clear();
    router.push("/login");
  };

  const handleContactClick = (contactId: string) => {
    router.push(`/message/${contactId}`);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Contacts</h2>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-500 transition px-2 py-1 rounded-lg hover:bg-red-50"
          title="Logout"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
            <path fillRule="evenodd" d="M7.5 3.75A1.5 1.5 0 006 5.25v13.5a1.5 1.5 0 001.5 1.5h6a1.5 1.5 0 001.5-1.5V15a.75.75 0 011.5 0v3.75a3 3 0 01-3 3h-6a3 3 0 01-3-3V5.25a3 3 0 013-3h6a3 3 0 013 3V9A.75.75 0 0115 9V5.25a1.5 1.5 0 00-1.5-1.5h-6zm10.72 4.72a.75.75 0 011.06 0l3 3a.75.75 0 010 1.06l-3 3a.75.75 0 11-1.06-1.06l1.72-1.72H9a.75.75 0 010-1.5h10.94l-1.72-1.72a.75.75 0 010-1.06z" clipRule="evenodd" />
          </svg>
          Logout
        </button>
      </div>

      {isLoading && <p className="text-center text-gray-500">Loading contacts...</p>}
      {error && <p className="text-center text-red-500">Error loading contacts</p>}

      <div className="space-y-2">
        {contactsData && contactsData.length > 0 ? (
          contactsData.map((contact) => (
            <div
              key={contact._id}
              onClick={() => handleContactClick(contact._id)}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 cursor-pointer transition"
            >
              <div className="relative">
                <img
                  src={contact.avatar || "https://via.placeholder.com/40"}
                  alt={contact.username}
                  className="w-10 h-10 rounded-full object-cover"
                />
                {contact.isOnline && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border border-white"></div>
                )}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{contact.username}</p>
                <p className="text-xs text-gray-500">
                  {contact.isOnline ? "Online" : `Last seen ${new Date(contact.lastSeen).toLocaleDateString()}`}
                </p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500 mt-8">No contacts yet</p>
        )}
      </div>
    </div>
  )
}

export default MyContacts
