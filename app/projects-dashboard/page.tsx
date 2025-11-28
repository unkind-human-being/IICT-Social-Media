"use client";

import { useEffect, useState } from "react";
import { db } from "@/firebase/firebaseConfig";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import Link from "next/link";

type Project = {
  id: string;
  title: string;
  description: string;
  subject: string;
  link: string;
  createdBy: string;
  likes: number;
  hearts: number;
  comments: any[];
};

export default function ProjectsDashboard() {
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    const q = query(collection(db, "projects"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      const arr = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Project, "id">),
      }));
      setProjects(arr);
    });
    return () => unsub();
  }, []);

  return (
    <main className="min-h-screen p-8 bg-gray-100 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">
            School Projects 🚀
          </h1>

          <Link href="/projects-dashboard/new-project">
            <button className="px-5 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold shadow hover:scale-105 transition">
              ➕ Add Project
            </button>
          </Link>
        </div>

        {/* Projects List */}
        <div className="space-y-6">
          {projects.map((p) => (
            <Link key={p.id} href={`/projects-dashboard/${p.id}`}>
              <div className="cursor-pointer p-6 rounded-2xl bg-white dark:bg-gray-800 shadow hover:shadow-xl hover:scale-[1.02] transition-all">
                <h2 className="text-2xl font-bold dark:text-white">{p.title}</h2>
                <p className="text-gray-700 dark:text-gray-300">{p.description}</p>

                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  📘 Subject: {p.subject}
                </p>

                <div className="flex gap-6 text-sm text-gray-700 dark:text-gray-300 mt-3">
                  ❤️ {p.hearts || 0}
                  👍 {p.likes || 0}
                  💬 {p.comments?.length || 0}
                </div>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </main>
  );
}
