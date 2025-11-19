"use client";

import { useEffect, useState } from "react";
import { db } from "@/firebase/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

interface Post {
  title?: string;
  content?: string;
  author?: string;
}

export default function PostDetails({ params }: { params: { id: string } }) {
  const { id } = params;

  // FIX: Loose type to avoid Vercel build errors
  const [post, setPost] = useState<Post | null>(null);

  useEffect(() => {
    const loadPost = async () => {
      const ref = doc(db, "posts", id);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        setPost(snap.data() as Post);
      }
    };

    loadPost();
  }, [id]);

  if (!post)
    return (
      <div className="h-screen flex items-center justify-center text-gray-500">
        Loading post...
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-5 transition-all">
      <div className="max-w-xl mx-auto bg-white dark:bg-gray-800 p-6 rounded-md shadow border dark:border-gray-700">
        <h1 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
          {post.title}
        </h1>

        <p className="text-gray-700 dark:text-gray-300 mb-4">
          {post.content}
        </p>

        <p className="text-sm text-gray-600 dark:text-gray-400">
          Posted by: {post.author || "Unknown"}
        </p>

        <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
          Post ID: {id}
        </p>
      </div>
    </div>
  );
}
