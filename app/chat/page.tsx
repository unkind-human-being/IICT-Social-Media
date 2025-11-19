"use client";

import { useState, useEffect, useRef } from "react";
import type { User } from "firebase/auth";
import { auth, db } from "@/firebase/firebaseConfig";
import {
  addDoc,
  collection,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

export default function ChatPage() {
  // Fix TypeScript: define User | null
  const [user, setUser] = useState<User | null>(null);

  // Messages type loosened to avoid TS build errors
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");

  const bottomRef = useRef<HTMLDivElement | null>(null);

  // Watch for logged-in user
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      // FIXED: casting ensures Vercel will accept the type
      setUser(currentUser as User | null);
    });

    return () => unsub();
  }, []);

  // Load messages in real-time
  useEffect(() => {
    const q = query(collection(db, "chat"), orderBy("createdAt", "asc"));

    const unsubscribe = onSnapshot(q, (snap) => {
      const arr = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMessages(arr);

      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    });

    return () => unsubscribe();
  }, []);

  // Send message with IGN (username)
  const sendMessage = async () => {
    if (!input.trim()) return;

    await addDoc(collection(db, "chat"), {
      text: input,
      name: user?.displayName || "Unknown", // IGN is included
      createdAt: serverTimestamp(),
    });

    setInput("");
  };

  if (!user)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 to-black text-white">
        <p className="text-xl animate-pulse">Please login to access the chat…</p>
      </div>
    );

  return (
    <main className="min-h-screen flex flex-col bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white p-4">
      <h1 className="text-3xl font-extrabold text-center mb-4 drop-shadow-lg tracking-wide">
        🚀 IICT Global Chat
      </h1>

      {/* Chat Box */}
      <div className="flex-1 bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl p-4 overflow-y-auto mb-4 border border-white/20">
        {messages.map((msg) => {
          const isMe = msg.name === user.displayName;

          return (
            <div
              key={msg.id}
              className={`mb-4 flex ${isMe ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-xs p-3 rounded-2xl shadow-lg transition-all ${
                  isMe
                    ? "bg-gradient-to-r from-blue-500 to-sky-400 text-white rounded-br-none"
                    : "bg-white/20 text-white backdrop-blur-md rounded-bl-none"
                }`}
              >
                <p className="font-semibold text-sm">{msg.name}</p>
                <p className="text-sm">{msg.text}</p>
              </div>
            </div>
          );
        })}

        <div ref={bottomRef}></div>
      </div>

      {/* Message Input */}
      <div className="flex gap-3 items-center">
        <input
          type="text"
          placeholder="Type a message..."
          className="flex-1 p-3 rounded-xl border border-white/30 bg-white/10 outline-none text-white placeholder-white/60 backdrop-blur-md focus:ring-2 focus:ring-blue-400 transition-all"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />

        <button
          onClick={sendMessage}
          className="px-5 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:scale-105 active:scale-95 transition-all"
        >
          🚀 Send
        </button>
      </div>
    </main>
  );
}
