"use client";

import { useEffect, useState } from "react";
import { db } from "@/firebase/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

export default function PostDetails({ params }) {
  const { id } = params; // the dynamic ID from the URL
  const [post, setPost] = useState(null);

  useEffect(() => {
    const loadPost = async () => {
      const ref = doc(db, "posts", id);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        setPost(snap.data());
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
    <div className="min-h-screen bg-gray-100 p-5">
      <div className="max-w-xl mx-auto bg-white p-6 rounded-md shadow">
        <h1 className="text-2xl font-bold mb-2">{post.title}</h1>
        <p className="text-gray-700 mb-4">{post.content}</p>

        <p className="text-sm text-gray-500">
          Posted by: {post.author || "Unknown"}  
        </p>

        <p className="text-xs text-gray-400 mt-2">
          Post ID: {id}
        </p>
      </div>
    </div>
  );
}
