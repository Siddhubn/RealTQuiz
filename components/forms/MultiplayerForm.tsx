"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { generateQuestions } from "@/lib/generateQuestions";

interface Props {
  onBack: () => void;
}

type Step = "choose" | "create" | "join";

export default function MultiplayerForm({ onBack }: Props) {
  const router = useRouter();
  const createUser = useMutation(api.users.createUser);
  const createRoom = useMutation(api.rooms.createRoom);
  const joinRoom = useMutation(api.rooms.joinRoom);
  const generateQuiz = useMutation(api.questions.generateQuizQuestions);

  const activeRooms = useQuery(api.rooms.getActiveRooms);

  const [step, setStep] = useState<Step>("choose");
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) { alert("Enter your name"); return; }
    if (!age || Number(age) < 5) { alert("Enter a valid age"); return; }
    try {
      setLoading(true);
      const userId = await createUser({ name, age: Number(age), mode: "multi" });
      const questions = await generateQuestions(Number(age));
      const { roomId, code } = await createRoom({ hostUserId: userId });
      await generateQuiz({ roomId, questions });
      localStorage.setItem("quizUserId", userId);
      localStorage.setItem("quizRoomId", roomId);
      localStorage.setItem("quizRoomCode", code);
      router.push(`/room/${code}`);
    } catch (err) {
      console.error(err);
      alert("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (code: string) => {
    const c = code.trim().toUpperCase();
    if (!c) { alert("Enter a room code"); return; }
    if (!name.trim()) { alert("Enter your name"); return; }
    if (!age || Number(age) < 5) { alert("Enter a valid age"); return; }
    try {
      setLoading(true);
      const userId = await createUser({ name, age: Number(age), mode: "multi" });
      const { roomId } = await joinRoom({ code: c, userId });
      localStorage.setItem("quizUserId", userId);
      localStorage.setItem("quizRoomId", roomId);
      localStorage.setItem("quizRoomCode", c);
      router.push(`/room/${c}`);
    } catch (err: any) {
      alert(err.message || "Could not join room.");
    } finally {
      setLoading(false);
    }
  };

  if (step === "choose") {
    return (
      <div className="w-full max-w-md bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/10 shadow-2xl text-white">
        <button onClick={onBack} className="text-white/50 hover:text-white mb-6 flex items-center gap-2 text-sm">
          ← Back
        </button>
        <h2 className="text-2xl font-bold mb-6 text-center">Multiplayer</h2>
        <div className="space-y-4">
          <button
            onClick={() => setStep("create")}
            className="w-full bg-purple-600 hover:bg-purple-700 transition-all p-4 rounded-xl font-semibold"
          >
            🏠 Create a Room
          </button>
          <button
            onClick={() => setStep("join")}
            className="w-full bg-white/10 hover:bg-white/20 transition-all p-4 rounded-xl font-semibold"
          >
            🚪 Join a Room
          </button>
        </div>

        {activeRooms && activeRooms.length > 0 && (
          <div className="mt-8">
            <p className="text-white/50 text-sm mb-3">Open Rooms</p>
            <div className="space-y-2">
              {activeRooms.map((room) => (
                <button
                  key={room._id}
                  onClick={() => { setJoinCode(room.code); setStep("join"); }}
                  className="w-full flex items-center justify-between bg-black/30 hover:bg-black/50 transition-all p-3 rounded-xl border border-white/10"
                >
                  <span className="font-mono font-bold text-purple-300 text-lg">{room.code}</span>
                  <span className="text-white/40 text-xs">Tap to join</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="w-full max-w-md bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/10 shadow-2xl text-white">
      <button onClick={() => setStep("choose")} className="text-white/50 hover:text-white mb-6 flex items-center gap-2 text-sm">
        ← Back
      </button>
      <h2 className="text-2xl font-bold mb-6 text-center">
        {step === "create" ? "Create Room" : "Join Room"}
      </h2>
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
        {step === "join" && (
          <input
            type="text"
            placeholder="Room code (e.g. ABC123)"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            maxLength={6}
            className="w-full p-3 rounded-xl bg-black/40 border border-white/20 outline-none font-mono uppercase tracking-widest text-center text-xl"
          />
        )}
        <button
          onClick={step === "create" ? handleCreate : () => handleJoin(joinCode)}
          disabled={loading}
          className="w-full bg-purple-600 hover:bg-purple-700 transition-all p-3 rounded-xl font-semibold disabled:opacity-60"
        >
          {loading ? "Please wait..." : step === "create" ? "Create & Enter Lobby" : "Join Room"}
        </button>
      </div>
    </div>
  );
}
