"use client";

import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

function formatTime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
}

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function LeaderboardPage() {
  const router = useRouter();
  const entries = useQuery(api.leaderboard.getGlobalLeaderboard);

  return (
    <main className="min-h-screen bg-[#050816] text-white px-4 py-10">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.push("/")}
            className="text-white/50 hover:text-white text-sm"
          >
            ← Home
          </button>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <span>🏆</span> Global Leaderboard
          </h1>
        </div>

        <p className="text-white/40 text-sm mb-6">Single player attempts — sorted by score</p>

        {entries === undefined && (
          <div className="text-center text-white/40 animate-pulse py-20">Loading...</div>
        )}

        {entries && entries.length === 0 && (
          <div className="text-center text-white/40 py-20">
            No attempts yet. Be the first!
          </div>
        )}

        {entries && entries.length > 0 && (
          <div className="space-y-3">
            {entries.map((entry, i) => {
              const medals = ["🥇", "🥈", "🥉"];
              const percentage = Math.round((entry.score / 10) * 100);
              return (
                <div
                  key={entry._id}
                  className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                    i === 0
                      ? "bg-yellow-500/10 border-yellow-400/30"
                      : i === 1
                      ? "bg-white/10 border-white/20"
                      : i === 2
                      ? "bg-orange-500/10 border-orange-400/20"
                      : "bg-white/5 border-white/10"
                  }`}
                >
                  <span className="text-xl w-8 text-center flex-shrink-0">
                    {medals[i] ?? <span className="text-white/30 text-sm">{i + 1}</span>}
                  </span>

                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{entry.name}</p>
                    <p className="text-white/40 text-xs">{formatDate(entry.completedAt)}</p>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-lg">{entry.score}/10</p>
                    <p className="text-white/40 text-xs">{percentage}%</p>
                  </div>

                  <div className="text-right flex-shrink-0 w-16">
                    <p className="text-sm text-white/60">{formatTime(entry.timeTaken)}</p>
                    <p className="text-white/30 text-xs">time</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
