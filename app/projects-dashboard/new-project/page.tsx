"use client";

import { useState } from "react";
import { db, auth } from "@/firebase/firebaseConfig";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function NewProject() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [link, setLink] = useState("");
  const [description, setDescription] = useState("");

  const saveProject = async () => {
    if (!title || !subject || !link || !description) {
      alert("Please complete all fields.");
      return;
    }

    const user = auth.currentUser;

    await addDoc(collection(db, "projects"), {
      title,
      subject,
      link,
      description,
      createdBy: user?.displayName || "Unknown",
      createdAt: serverTimestamp(),
    });

    router.push("/projects-dashboard");
  };

  return (
    <main className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6 flex justify-center">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl w-full max-w-md">

        <h1 className="text-2xl font-bold mb-4 dark:text-white">Add School Project</h1>

        <input
          type="text"
          placeholder="Project Title"
          className="w-full p-2 mb-3 border rounded dark:bg-gray-700 dark:text-white"
          onChange={(e) => setTitle(e.target.value)}
        />

        <input
          type="text"
          placeholder="Subject (e.g., ICT, WebDev)"
          className="w-full p-2 mb-3 border rounded dark:bg-gray-700 dark:text-white"
          onChange={(e) => setSubject(e.target.value)}
        />

        <input
          type="url"
          placeholder="Project Link"
          className="w-full p-2 mb-3 border rounded dark:bg-gray-700 dark:text-white"
          onChange={(e) => setLink(e.target.value)}
        />

        <textarea
          placeholder="Short Description"
          className="w-full p-2 mb-3 border rounded h-32 dark:bg-gray-700 dark:text-white"
          onChange={(e) => setDescription(e.target.value)}
        />

        <button
          onClick={saveProject}
          className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded"
        >
          Publish Project
        </button>

      </div>
    </main>
  );
}
