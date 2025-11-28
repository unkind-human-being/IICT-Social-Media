"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { db, auth } from "@/firebase/firebaseConfig";
import {
  doc,
  onSnapshot,
  updateDoc,
  arrayUnion,
  increment,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

export default function ProjectDetails() {
  const { id } = useParams();

  const [project, setProject] = useState<any>(null);
  const [user, setUser] = useState<any>(null);

  const [newComment, setNewComment] = useState("");
  const [showComments, setShowComments] = useState(false);

  // Watch user login state
  useEffect(() => {
    onAuthStateChanged(auth, (u) => setUser(u));
  }, []);

  // Load project real-time
  useEffect(() => {
    if (!id) return;

    const ref = doc(db, "projects", id as string);
    return onSnapshot(ref, (snap) => {
      if (snap.exists()) setProject(snap.data());
    });
  }, [id]);

  // ⭐ NEW REACTION SYSTEM — USER CAN CHANGE REACTION ANYTIME
  const react = async (type: "heart" | "like") => {
    if (!user) return alert("Login to react!");

    const ref = doc(db, "projects", id as string);
    const current = project.reactions?.[user.uid];

    // If clicking the same reaction → do nothing
    if (current === type) return;

    let updates: any = {};

    // Remove old reaction count
    if (current === "heart") updates.hearts = increment(-1);
    if (current === "like") updates.likes = increment(-1);

    // Add new reaction count
    if (type === "heart") updates.hearts = increment(1);
    if (type === "like") updates.likes = increment(1);

    // Save new reaction
    updates[`reactions.${user.uid}`] = type;

    await updateDoc(ref, updates);
  };

  // Add comment
  const submitComment = async () => {
    if (!newComment.trim()) return;
    if (!user) return alert("Login first");

    const ref = doc(db, "projects", id as string);

    await updateDoc(ref, {
      comments: arrayUnion({
        id: crypto.randomUUID(),
        text: newComment,
        author: user.displayName || "Unknown",
        createdAt: Date.now(),
      }),
    });

    setNewComment("");
  };

  if (!project)
    return <div className="p-10 text-gray-500">Loading…</div>;

  const userReaction = project.reactions?.[user?.uid];

  return (
    <div className="min-h-screen p-6 bg-gray-100 dark:bg-gray-900">
      <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl">

        {/* Title */}
        <h1 className="text-3xl font-bold dark:text-white mb-2">
          {project.title}
        </h1>

        <p className="text-gray-700 dark:text-gray-300 mb-3">{project.description}</p>

        <p className="text-gray-500 dark:text-gray-400 mb-5">
          📘 Subject: {project.subject}
        </p>

        {/* Visit Website */}
        <a
          href={project.link}
          target="_blank"
          className="text-sm inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition mb-6"
        >
          🌐 Visit Website
        </a>

        {/* Reactions */}
        <div className="flex gap-6 text-lg mb-6">

          {/* ❤️ HEART */}
          <button
            onClick={() => react("heart")}
            className={`transition ${
              userReaction === "heart"
                ? "scale-125 text-red-500"
                : "text-red-400 hover:scale-110"
            }`}
          >
            ❤️ {project.hearts || 0}
          </button>

          {/* 👍 LIKE */}
          <button
            onClick={() => react("like")}
            className={`transition ${
              userReaction === "like"
                ? "scale-125 text-yellow-500"
                : "text-yellow-400 hover:scale-110"
            }`}
          >
            👍 {project.likes || 0}
          </button>
        </div>

        {/* Comments toggle */}
        <button
          onClick={() => setShowComments(!showComments)}
          className="text-blue-600 underline mb-3"
        >
          {showComments ? "Hide Comments" : "View Comments"}
        </button>

        {/* Comments list */}
        {showComments && (
          <div className="space-y-3 mb-6">
            {project.comments?.map((c: any) => (
              <div
                key={c.id}
                className="p-3 bg-gray-200 dark:bg-gray-700 rounded-lg"
              >
                <p className="font-semibold">{c.author}</p>
                <p>{c.text}</p>
              </div>
            ))}

            {project.comments?.length === 0 && (
              <p className="text-gray-500">No comments yet…</p>
            )}
          </div>
        )}

        {/* Comment input */}
        {user && (
          <div className="flex gap-2 mt-3">
            <input
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="flex-1 p-2 border rounded dark:bg-gray-700 dark:text-white"
              placeholder="Write a comment…"
            />

            <button
              onClick={submitComment}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Send
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
