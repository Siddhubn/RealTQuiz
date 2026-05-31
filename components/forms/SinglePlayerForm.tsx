"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { generateQuestions } from "@/lib/generateQuestions";
import toast from "react-hot-toast";

interface Props {
  onBack: () => void;
}

export default function SinglePlayerForm({ onBack }: Props) {
  const router = useRouter();
  const createUser = useMutation(api.users.createUser);
  const generateQuiz = useMutation(api.questions.generateQuizQuestions);

  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [loading, setLoading] = useState(false);

  const handleStart = async () => {
    if (!name.trim()) { toast.error("Enter your name"); return; }
    if (!age || Number(age) < 5) { toast.error("Enter a valid age (5+)"); return; }

    try {
      setLoading(true);
      const userId = await createUser({ name, age: Number(age), mode: "single" });
      const questions = await generateQuestions(Number(age));
      await generateQuiz({ userId, questions });
      localStorage.setItem("quizUserId", userId);
      router.push(`/quiz/${userId}`);
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/10 shadow-2xl text-white">
      <button onClick={onBack} className="text-white/50 hover:text-white mb-6 flex items-center gap-2 text-sm">
        ← Back
      </button>
      <h2 className="text-2xl font-bold mb-6 text-center">Single Player</h2>
      <div className="space-y-4">
        <input
          type="text"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-3 rounded-xl bg-black/40 border border-white/20 outline-none"
        />
        <input
          type="number"
          placeholder="Your age"
          value={age}
          onChange={(e) => setAge(e.target.value)}
          className="w-full p-3 rounded-xl bg-black/40 border border-white/20 outline-none"
        />
        <button
          onClick={handleStart}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 transition-all p-3 rounded-xl font-semibold disabled:opacity-60"
        >
          {loading ? "Creating Quiz..." : "Start Quiz"}
        </button>
      </div>
    </div>
  );
}
