"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function ResultPage() {
  const params = useParams();
  const userId = params.userId as string;
  const router = useRouter();

  const user = useQuery(api.users.getUser, { userId: userId as any });

  if (user === undefined) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#050816] text-white">
        <div className="animate-pulse text-2xl">Loading...</div>
      </main>
    );
  }

  if (user === null) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#050816] text-white">
        <div className="text-2xl">User not found.</div>
      </main>
    );
  }

  const percentage = Math.round((user.score / 10) * 100);
  const message =
    percentage >= 80 ? "Excellent work!" : percentage >= 50 ? "Good effort!" : "Keep practicing!";

  const timeTaken =
    user.startedAt && user.finishedAt
      ? Math.round((user.finishedAt - user.startedAt) / 1000)
      : null;

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#050816] text-white px-4">
      <div className="w-full max-w-xl bg-white/10 p-10 rounded-2xl text-center">
        <h1 className="text-5xl font-bold mb-6">Quiz Completed!</h1>
        <p className="text-2xl mb-2">{user.name}</p>
        <p className="text-white/60 mb-8">{message}</p>
        <div className="text-7xl font-bold mb-4">{user.score}/10</div>
        <p className="text-white/60 mb-2">{percentage}% correct</p>
        {timeTaken !== null && (
          <p className="text-white/40 text-sm mb-10">Completed in {timeTaken}s</p>
        )}

        <div className="flex gap-3 justify-center">
          <button
            onClick={() => router.push("/leaderboard")}
            className="bg-white/10 hover:bg-white/20 transition-all px-6 py-3 rounded-xl font-semibold"
          >
            🏆 Leaderboard
          </button>
          <button
            onClick={() => router.push("/")}
            className="bg-blue-600 hover:bg-blue-700 transition-all px-6 py-3 rounded-xl font-semibold"
          >
            Play Again
          </button>
        </div>
      </div>
    </main>
  );
}
