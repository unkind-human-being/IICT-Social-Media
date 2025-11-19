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
    <main className="min-h-screen flex items-center justify-center px-4
      bg-gray-100 dark:bg-gray-900 transition-colors">
      
      <div className="
        w-full max-w-lg p-8 rounded-2xl shadow-xl
        bg-white dark:bg-gray-800 
        border border-gray-200 dark:border-gray-700
        backdrop-blur-lg transition-all duration-300
      ">
        
        <h1 className="text-2xl font-extrabold mb-6 
          text-gray-900 dark:text-white tracking-wide">
          ✏️ Create New Post
        </h1>

        {/* Title Input */}
        <div className="mb-4">
          <label className="block mb-1 text-gray-700 dark:text-gray-300 font-medium">
            Post Title
          </label>
          <input
            type="text"
            className="
              w-full p-3 rounded-lg border 
              bg-gray-50 dark:bg-gray-700
              text-gray-900 dark:text-white
              border-gray-300 dark:border-gray-600
              focus:ring-2 focus:ring-blue-500 
              outline-none transition-all
            "
            placeholder="Enter a catchy title..."
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        {/* Content Input */}
        <div className="mb-5">
          <label className="block mb-1 text-gray-700 dark:text-gray-300 font-medium">
            Content
          </label>
          <textarea
            className="
              w-full p-3 rounded-lg border 
              h-40 resize-none
              bg-gray-50 dark:bg-gray-700
              text-gray-900 dark:text-white
              border-gray-300 dark:border-gray-600
              focus:ring-2 focus:ring-blue-500 
              outline-none transition-all
            "
            placeholder="Write something amazing..."
            onChange={(e) => setContent(e.target.value)}
          />
        </div>

        {/* Save Button */}
        <button
          onClick={savePost}
          className="
            w-full py-3 rounded-lg 
            bg-blue-600 hover:bg-blue-700 
            dark:bg-blue-500 dark:hover:bg-blue-600
            text-white font-semibold 
            shadow-md hover:shadow-lg 
            transition-all active:scale-95
          "
        >
          🚀 Publish Post
        </button>

        {/* Back Button */}
        <button
          onClick={() => router.push("/dashboard")}
          className="
            w-full mt-4 py-2 text-gray-600 dark:text-gray-300 
            hover:text-gray-900 dark:hover:text-white
            transition-all
          "
        >
          ⬅ Back to Dashboard
        </button>
      </div>
    </main>
  );
}
