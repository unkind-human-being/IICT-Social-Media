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
        setComments(data.comments || []); // Ensure no error
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
      createdAt: Date.now(), // FIX: No serverTimestamp here
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
        <p className="text-gray-500">Loading post...</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-100 p-5">
      <div className="max-w-xl mx-auto bg-white p-6 rounded-md shadow">

        <h1 className="text-2xl font-bold mb-2">{post.title}</h1>
        <p className="text-gray-700 mb-4">{post.content}</p>

        <p className="text-sm text-gray-500 mb-4">
          Posted by: {post.author || "Unknown"}
        </p>

        <h2 className="text-xl font-semibold mb-2">Comments</h2>

        <div className="space-y-3 mb-4">
          {comments.length === 0 && (
            <p className="text-gray-500">No comments yet...</p>
          )}

          {comments.map((c) => (
            <div key={c.id} className="p-3 bg-gray-100 rounded-lg">
              <p className="font-semibold">{c.author}</p>
              <p>{c.text}</p>
            </div>
          ))}
        </div>

        {/* Comment Box */}
        {user ? (
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Write a comment..."
              className="flex-1 p-2 border rounded"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submitComment()}
            />

            <button
              onClick={submitComment}
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              Send
            </button>
          </div>
        ) : (
          <p className="text-gray-500 text-sm">Login to comment.</p>
        )}
      </div>
    </div>
  );
}
