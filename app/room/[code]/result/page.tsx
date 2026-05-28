"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { useEffect, useState } from "react";
import { api } from "@/convex/_generated/api";

export default function RoomResultPage() {
  const params = useParams();
  const code = (params.code as string).toUpperCase();
  const router = useRouter();

  const room = useQuery(api.rooms.getRoomByCode, { code });
  const members = useQuery(
    api.rooms.getRoomMembers,
    room ? { roomId: room._id } : "skip"
  );

  const [myUserId, setMyUserId] = useState<string | null>(null);

  useEffect(() => {
    setMyUserId(localStorage.getItem("quizUserId"));
  }, []);

  if (!room || !members) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#050816] text-white">
        <div className="animate-pulse text-2xl">Loading results...</div>
      </main>
    );
  }

  const winner = members[0];
  const myResult = members.find((m) => m._id === myUserId);

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#050816] text-white px-4 py-10">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🏆</div>
          <h1 className="text-4xl font-bold mb-2">Game Over!</h1>
          {winner && (
            <p className="text-white/60 text-lg">
              <span className="text-yellow-400 font-bold">{winner.name}</span> wins with{" "}
              <span className="font-bold">{winner.score}/10</span>!
            </p>
          )}
        </div>

        <div className="bg-white/10 p-6 rounded-2xl mb-6">
          <h2 className="font-bold text-lg mb-4">Final Standings</h2>
          <div className="space-y-3">
            {members.map((member, i) => {
              const isMe = member._id === myUserId;
              const medals = ["🥇", "🥈", "🥉"];
              return (
                <div
                  key={member._id}
                  className={`flex items-center gap-3 p-4 rounded-xl border ${
                    isMe
                      ? "bg-purple-600/30 border-purple-400/50"
                      : i === 0
                      ? "bg-yellow-500/10 border-yellow-400/30"
                      : "bg-black/30 border-white/10"
                  }`}
                >
                  <span className="text-xl w-8 text-center">
                    {medals[i] ?? `${i + 1}.`}
                  </span>
                  <span className="flex-1 font-medium">
                    {member.name}
                    {isMe && <span className="text-purple-300 text-xs ml-2">(you)</span>}
                  </span>
                  <span className="font-bold text-lg">{member.score}/10</span>
                </div>
              );
            })}
          </div>
        </div>

        {myResult && (
          <div className="bg-white/5 p-4 rounded-xl text-center mb-6 text-white/60 text-sm">
            Your score: <span className="text-white font-bold">{myResult.score}/10</span>
            {" · "}
            {Math.round((myResult.score / 10) * 100)}% correct
          </div>
        )}

        <button
          onClick={() => router.push("/")}
          className="w-full bg-purple-600 hover:bg-purple-700 transition-all p-4 rounded-xl font-semibold"
        >
          Play Again
        </button>
      </div>
    </main>
  );
}
