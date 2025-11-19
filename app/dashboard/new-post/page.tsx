"use client";

import { useState } from "react";
import { db, auth } from "@/firebase/firebaseConfig";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function NewPost() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const savePost = async () => {
    if (!title || !content) {
      alert("Please complete all fields.");
      return;
    }

    const user = auth.currentUser;

    await addDoc(collection(db, "posts"), {
      title,
      content,
      author: user?.displayName || user?.email || "Unknown",
      createdAt: serverTimestamp(),
    });

    router.push("/dashboard");
  };

  return (
    <main className="min-h-screen bg-gray-100 p-6 flex justify-center">
      <div className="bg-white p-6 rounded shadow w-full max-w-md">
        <h1 className="text-xl font-bold mb-4">Create New Post</h1>

        <input
          type="text"
          placeholder="Post Title"
          className="w-full p-2 border rounded mb-3"
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          placeholder="Write your content..."
          className="w-full p-2 border rounded mb-3 h-40"
          onChange={(e) => setContent(e.target.value)}
        />

        <button
          onClick={savePost}
          className="w-full py-2 bg-blue-600 text-white rounded"
        >
          Save Post
        </button>
      </div>
    </main>
  );
}
