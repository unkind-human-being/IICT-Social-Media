"use client";

import { useEffect, useState } from "react";
import { db, auth } from "@/firebase/firebaseConfig";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import Link from "next/link";
import { signOut } from "firebase/auth";

export default function Dashboard() {
  // FIX: add type to avoid Vercel build error
  const [posts, setPosts] = useState<any[]>([]);
  const [theme, setTheme] = useState("light");

  // Load posts in realtime
  useEffect(() => {
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPosts(data); // <-- fixed
    });
    return () => unsubscribe();
  }, []);

  // Load theme from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("theme") || "light";
    setTheme(saved);
    document.documentElement.classList.toggle("dark", saved === "dark");
  }, []);

  // Toggle theme
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
    localStorage.setItem("theme", newTheme);
  };

  const logout = async () => {
    await signOut(auth);
    window.location.href = "/login";
  };

  return (
    <main className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-500 p-5">
      <div className="max-w-2xl mx-auto">

        {/* Dashboard Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white transition-all">
            Dashboard
          </h1>

          <div className="flex gap-3">
            {/* Dark Mode Button */}
            <button
              onClick={toggleTheme}
              className="px-3 py-1 rounded-lg shadow bg-gray-800 dark:bg-yellow-400 
              text-white dark:text-black transition-all hover:scale-105"
            >
              {theme === "light" ? "🌙 Dark" : "☀️ Light"}
            </button>

            <Link href="/chat">
              <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded-lg shadow transition-all hover:scale-105">
                Chat
              </button>
            </Link>

            <button
              onClick={logout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded-lg shadow transition-all hover:scale-105"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Add Post Button */}
        <Link href="/dashboard/new-post">
          <button className="w-full py-3 mb-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow transition-all hover:scale-[1.02]">
            ➕ Create New Post
          </button>
        </Link>

        {/* Posts List */}
        <div className="space-y-4">
          {posts.length === 0 && (
            <p className="text-center text-gray-500 dark:text-gray-300">
              No posts yet...
            </p>
          )}

          {posts.map((post) => (
            <Link key={post.id} href={`/post/${post.id}`}>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow hover:shadow-xl cursor-pointer 
              hover:bg-gray-50 dark:hover:bg-gray-700 transition-all hover:scale-[1.01]">

                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {post.title}
                </h2>

                <p className="text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">
                  {post.content}
                </p>

                <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                  Posted by: {post.author || "Unknown"}
                </p>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </main>
  );
}
