"use client";

import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { useEffect, useRef, useState } from "react";
import { api } from "@/convex/_generated/api";

export default function RoomLobby() {
  const params = useParams();
  const code = (params.code as string).toUpperCase();
  const router = useRouter();

  const room = useQuery(api.rooms.getRoomByCode, { code });
  const members = useQuery(
    api.rooms.getRoomMembers,
    room ? { roomId: room._id } : "skip"
  );
  const startRoom = useMutation(api.rooms.startRoom);

  const [userId, setUserId] = useState<string | null>(null);
  const redirectedRef = useRef(false);

  useEffect(() => {
    const id = localStorage.getItem("quizUserId");
    setUserId(id);
  }, []);

  useEffect(() => {
    if (!userId) return;
    if (redirectedRef.current) return;
    if (room?.status === "active") {
      redirectedRef.current = true;
      router.push(`/quiz/${userId}`);
    }
  }, [room?.status, userId, router]);

  const handleStart = async () => {
    if (!room || !userId) return;
    await startRoom({ roomId: room._id });
  };

  if (room === undefined) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#050816] text-white">
        <div className="animate-pulse text-2xl">Loading room...</div>
      </main>
    );
  }

  if (room === null) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#050816] text-white">
        <div className="text-xl text-white/60">Room not found.</div>
      </main>
    );
  }

  const isHost = userId && room.hostUserId === userId;

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#050816] text-white px-4">
      <div className="w-full max-w-lg">
        <div className="bg-white/10 p-8 rounded-2xl mb-6 text-center">
          <p className="text-white/50 text-sm mb-2">Room Code</p>
          <p className="text-5xl font-mono font-bold tracking-widest text-purple-300">{code}</p>
          <p className="text-white/40 text-sm mt-3">Share this code with others to join</p>
        </div>

        <div className="bg-white/10 p-6 rounded-2xl mb-6">
          <h2 className="text-lg font-bold mb-4">
            Players ({members?.length ?? 0})
          </h2>
          <div className="space-y-2">
            {members?.map((member, i) => (
              <div
                key={member._id}
                className="flex items-center gap-3 bg-black/30 p-3 rounded-xl"
              >
                <span className="text-white/40 text-sm w-5">{i + 1}</span>
                <span className="flex-1 font-medium">{member.name}</span>
                {room.hostUserId === member._id && (
                  <span className="text-xs bg-purple-600 px-2 py-0.5 rounded-full">Host</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {isHost ? (
          <button
            onClick={handleStart}
            disabled={(members?.length ?? 0) < 1}
            className="w-full bg-purple-600 hover:bg-purple-700 transition-all p-4 rounded-xl font-semibold text-lg disabled:opacity-50"
          >
            Start Quiz for Everyone
          </button>
        ) : (
          <div className="text-center text-white/50 p-4 bg-white/5 rounded-xl">
            Waiting for the host to start the quiz...
          </div>
        )}
      </div>
    </main>
  );
}
