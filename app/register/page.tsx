"use client";

import { useState } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, db } from "@/firebase/firebaseConfig";
import { doc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function Register() {
  const router = useRouter();
  const [name, setName] = useState("");       // IGN
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const registerUser = async () => {
    if (!name || !email || !password) {
      alert("Please fill all fields.");
      return;
    }

    try {
      setLoading(true);

      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCred.user;

      // Save IGN to Firebase Auth
      await updateProfile(user, {
        displayName: name,
      });

      // Save user to Firestore
      await setDoc(doc(db, "users", user.uid), {
        name,
        email,
        uid: user.uid,
        createdAt: new Date(),
      });

      router.push("/dashboard");
    } catch (err: any) {
      alert("Registration failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center 
      bg-gray-100 dark:bg-gray-900 p-5 transition-all">

      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg 
        w-full max-w-sm border border-gray-300 dark:border-gray-700 
        transition-all">

        <h1 className="text-3xl font-bold mb-5 text-center 
          text-gray-900 dark:text-white">
          Create Account
        </h1>

        {/* IGN / Display Name */}
        <input
          type="text"
          placeholder="Name / IGN"
          className="w-full p-3 mb-3 rounded-lg border 
            bg-gray-50 dark:bg-gray-700 
            text-gray-900 dark:text-white 
            border-gray-300 dark:border-gray-600
            outline-none focus:ring-2 focus:ring-purple-500"
          onChange={(e) => setName(e.target.value)}
        />

        {/* Email */}
        <input
          type="email"
          placeholder="Email"
          className="w-full p-3 mb-3 rounded-lg border 
            bg-gray-50 dark:bg-gray-700 
            text-gray-900 dark:text-white 
            border-gray-300 dark:border-gray-600
            outline-none focus:ring-2 focus:ring-purple-500"
          onChange={(e) => setEmail(e.target.value)}
        />

        {/* Password */}
        <input
          type="password"
          placeholder="Password"
          className="w-full p-3 mb-4 rounded-lg border 
           bg-gray-50 dark:bg-gray-700
           text-gray-900 dark:text-white
           border-gray-300 dark:border-gray-600 
           outline-none focus:ring-2 focus:ring-purple-500"
          onChange={(e) => setPassword(e.target.value)}
        />

        {/* Register Button */}
        <button
          onClick={registerUser}
          disabled={loading}
          className="w-full py-3 rounded-lg bg-purple-600 hover:bg-purple-700 
            text-white font-semibold shadow-md transition-transform 
            hover:scale-[1.02] active:scale-95 disabled:bg-purple-300"
        >
          {loading ? "Creating Account..." : "Register"}
        </button>

      </div>
    </div>
  );
}
