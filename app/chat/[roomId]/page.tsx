"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { db, auth } from "@/firebase/firebaseConfig";
import {
  doc,
  setDoc,
  arrayUnion,
  onSnapshot,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import Link from "next/link";

// -----------------------------------------------------
// CLOUDINARY UPLOAD (FIXED)
// -----------------------------------------------------
async function uploadToCloudinary(file: File) {
  const form = new FormData();
  form.append("file", file);
  form.append(
    "upload_preset",
    process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!
  );

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/upload`,
    {
      method: "POST",
      body: form,
    }
  );

  return res.json();
}

export default function RoomChat() {
  const { roomId } = useParams();

  const [user, setUser] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [uploading, setUploading] = useState(false);

  const bottomRef = useRef<HTMLDivElement | null>(null);

  // -----------------------------------------------------
  // WATCH AUTH
  // -----------------------------------------------------
  useEffect(() => {
    onAuthStateChanged(auth, (u) => setUser(u));
  }, []);

  // -----------------------------------------------------
  // LOAD MESSAGES
  // -----------------------------------------------------
  useEffect(() => {
    if (!roomId) return;

    const ref = doc(db, "chatRooms", roomId as string);

    return onSnapshot(ref, async (snap) => {
      if (snap.exists()) {
        setMessages(snap.data().messages || []);
      } else {
        await setDoc(ref, { messages: [] }, { merge: true });
      }

      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 150);
    });
  }, [roomId]);

  // -----------------------------------------------------
  // SEND MESSAGE
  // -----------------------------------------------------
  const sendMessage = async (extra: any = {}) => {
    if (!user) return alert("Login first!");
    if (!text.trim() && !extra.image && !extra.file) return;

    const ref = doc(db, "chatRooms", roomId as string);

    await setDoc(
      ref,
      {
        messages: arrayUnion({
          id: crypto.randomUUID(),
          text: text.trim(),
          ...extra,
          author: user.displayName || user.email,
          uid: user.uid,
          createdAt: Date.now(),
        }),
      },
      { merge: true }
    );

    setText("");
  };

  // -----------------------------------------------------
  // UPLOAD FILE / IMAGE
  // -----------------------------------------------------
  const handleUpload = async (e: any) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const result = await uploadToCloudinary(file);
    setUploading(false);

    if (result.secure_url) {
      const isImage = file.type.startsWith("image");

      await sendMessage({
        [isImage ? "image" : "file"]: result.secure_url,
        fileName: file.name,
      });
    }
  };

  // -----------------------------------------------------
  // LOGIN REQUIRED
  // -----------------------------------------------------
  if (!user)
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <p className="text-xl animate-pulse">
          Please login to access the room…
        </p>
      </div>
    );

  // -----------------------------------------------------
  // UI
  // -----------------------------------------------------
  return (
    <main className="min-h-screen flex bg-gradient-to-br from-[#09090b] via-[#1e1b4b] to-[#0f172a] text-white">

      {/* LEFT SIDEBAR */}
      <aside className="w-64 h-screen sticky top-0 bg-black/40 backdrop-blur-xl border-r border-white/10 p-5 hidden md:block overflow-y-auto">

        <h2 className="text-xl font-bold mb-4 text-purple-400">Chat Rooms</h2>

        <div className="space-y-3">
          <Link href="/chat">
            <div className="p-3 rounded-lg bg-white/10 border border-white/20 cursor-pointer hover:bg-white/20 transition">
              🌍 World Chat
            </div>
          </Link>

          {["room1", "room2", "room3", "room4", "room5", "room6"].map((room) => (
            <Link key={room} href={`/chat/${room}`}>
              <div
                className={`p-3 rounded-lg border cursor-pointer transition ${
                  room === roomId
                    ? "bg-purple-700/40 border-purple-500/50"
                    : "bg-white/10 border-white/20 hover:bg-white/20"
                }`}
              >
                💬 {room.toUpperCase()}
              </div>
            </Link>
          ))}
        </div>
      </aside>

      {/* MAIN CHAT PANEL */}
      <section className="flex-1 p-4 flex flex-col">

        <h1 className="text-3xl font-extrabold text-center mb-4 drop-shadow-lg">
          🔥 Room {roomId}
        </h1>

        {/* CHAT MESSAGES */}
        <div className="flex-1 bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl p-4 overflow-y-auto mb-4 border border-white/20">

          {messages.map((msg) => {
            const isMe = msg.uid === user.uid;

            return (
              <div key={msg.id} className={`mb-4 flex ${isMe ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-xs p-4 rounded-2xl shadow-lg ${
                    isMe
                      ? "bg-gradient-to-r from-blue-500 to-sky-400 text-white rounded-br-none"
                      : "bg-white/20 backdrop-blur text-white rounded-bl-none"
                  }`}
                >
                  <p className="text-sm font-semibold mb-1">{msg.author}</p>

                  {msg.text && <p className="mb-2">{msg.text}</p>}

                  {msg.image && (
                    <a href={msg.image} target="_blank">
                      <img
                        src={msg.image}
                        className="rounded-lg max-h-60 border border-white/20 hover:scale-105 transition"
                      />
                    </a>
                  )}

                  {msg.file && (
                    <a
                      href={msg.file}
                      target="_blank"
                      download={msg.fileName}
                      className="text-blue-300 underline text-sm"
                    >
                      📄 {msg.fileName}
                    </a>
                  )}
                </div>
              </div>
            );
          })}

          <div ref={bottomRef}></div>
        </div>

        {/* INPUT BAR */}
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Type a message..."
            className="flex-1 p-3 rounded-xl border border-white/30 bg-white/10 outline-none text-white placeholder-white/40 focus:ring-2 focus:ring-purple-500"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />

          <button
            onClick={() => sendMessage()}
            className="px-6 py-3 bg-purple-600 rounded-xl shadow-lg hover:bg-purple-700 hover:scale-105 transition"
          >
            🚀
          </button>
        </div>

        {/* UPLOAD FILE */}
        <div className="mt-4">
          <label className="cursor-pointer px-5 py-3 bg-blue-600 rounded-xl shadow-lg hover:bg-blue-700 transition inline-flex items-center gap-2">
            📎 Upload File
            <input type="file" className="hidden" onChange={handleUpload} />
          </label>

          {uploading && (
            <span className="ml-3 text-gray-300">Uploading…</span>
          )}
        </div>

      </section>
    </main>
  );
}
