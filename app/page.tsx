"use client";

import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-600 to-purple-700 text-white p-6">
      
      <h1 className="text-4xl font-extrabold mb-4 text-center">
        Welcome to IICT Social Media
      </h1>

      <p className="text-center text-lg max-w-md mb-8 opacity-90">
        A simple and modern platform for students to post, comment, and chat.
      </p>

      <div className="flex gap-4">
        <Link href="/login">
          <button className="px-6 py-2 bg-white text-blue-600 font-semibold rounded-lg shadow">
            Login
          </button>
        </Link>

        <Link href="/register">
          <button className="px-6 py-2 bg-white text-purple-600 font-semibold rounded-lg shadow">
            Register
          </button>
        </Link>
      </div>
    </main>
  );
}
