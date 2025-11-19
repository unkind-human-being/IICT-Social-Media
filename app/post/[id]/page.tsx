"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { db, auth } from "@/firebase/firebaseConfig";
import {
  doc,
  updateDoc,
  arrayUnion,
  onSnapshot,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

export default function PostDetails() {
  const params = useParams();
  const id = params?.id as string;

  const [post, setPost] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [user, setUser] = useState<any>(null);

  // Watch user login
  useEffect(() => {
    return onAuthStateChanged(auth, (u) => setUser(u));
  }, []);

  // Load post in real-time
  useEffect(() => {
    if (!id) return;

    const ref = doc(db, "posts", id);

    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setPost(data);
        setComments(data.comments || []); 
      }
    });

    return () => unsub();
  }, [id]);

  // Send comment
  const submitComment = async () => {
    if (!newComment.trim()) return;
    if (!user) return alert("Please login.");

    const ref = doc(db, "posts", id);

    const commentData = {
      id: crypto.randomUUID(),
      text: newComment,
      author: user.displayName || "Unknown",
      createdAt: Date.now(),
    };

    await updateDoc(ref, {
      comments: arrayUnion(commentData),
    });

    setNewComment("");
  };

  if (!id) return null;

  if (!post)
    return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">Loading post...</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6 flex justify-center transition-all">
      <div className="
        max-w-2xl w-full p-8 rounded-2xl shadow-2xl 
        bg-white dark:bg-gray-800 
        border border-gray-200 dark:border-gray-700
        backdrop-blur-xl
        transition-all
      ">

        {/* POST TITLE */}
        <h1 className="text-3xl font-extrabold mb-3 text-gray-900 dark:text-white tracking-wide">
          {post.title}
        </h1>

        <p className="text-gray-700 dark:text-gray-300 mb-4">{post.content}</p>

        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          Posted by: <span className="font-semibold">{post.author || "Unknown"}</span>
        </p>

        {/* COMMENTS HEADER */}
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
          💬 Comments
        </h2>

        {/* COMMENT LIST */}
        <div className="space-y-4">
          {comments.length === 0 && (
            <p className="text-gray-500 dark:text-gray-400">No comments yet…</p>
          )}

          {comments.map((c) => (
            <div
              key={c.id}
              className="
                p-4 rounded-xl shadow-md
                bg-gray-50 dark:bg-gray-700
                border border-gray-200 dark:border-gray-600
                hover:shadow-xl hover:border-blue-500
                transition-all duration-300
                relative overflow-hidden
              "
            >
              <p className="font-semibold text-gray-900 dark:text-white">
                {c.author}
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                {c.text}
              </p>
            </div>
          ))}
        </div>

        {/* COMMENT INPUT */}
        {user ? (
          <div className="flex gap-3 mt-6 items-center">
            <input
              type="text"
              placeholder="Write a comment..."
              className="
                flex-1 p-3 rounded-xl border
                bg-gray-50 dark:bg-gray-700
                border-gray-300 dark:border-gray-600
                text-gray-900 dark:text-white
                placeholder-gray-500 dark:placeholder-gray-400
                focus:ring-2 focus:ring-blue-500
                outline-none transition-all
              "
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && submitComment()}
            />

            <button
              onClick={submitComment}
              className="
                px-5 py-3 rounded-xl font-semibold 
                bg-gradient-to-r from-blue-500 to-purple-600 
                text-white shadow-md hover:shadow-xl 
                hover:scale-105 active:scale-95 
                transition-all
              "
            >
              🚀 Send
            </button>
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400 mt-4 text-sm">
            Login to comment.
          </p>
        )}
      </div>
    </div>
  );
}
