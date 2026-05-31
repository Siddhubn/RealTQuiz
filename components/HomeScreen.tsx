"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import SinglePlayerForm from "@/components/forms/SinglePlayerForm";
import MultiplayerForm from "@/components/forms/MultiplayerForm";
import AuthButton from "@/components/auth/AuthButton";

type Mode = "home" | "single" | "multi";

export default function HomeScreen() {
  const [mode, setMode] = useState<Mode>("home");
  const router = useRouter();

  if (mode === "single") return <SinglePlayerForm onBack={() => setMode("home")} />;
  if (mode === "multi") return <MultiplayerForm onBack={() => setMode("home")} />;

  return (
    <div className="w-full max-w-md text-white text-center">
      {/* Auth bar — sits at the top right, non-intrusive */}
      <div className="flex justify-end mb-6">
        <AuthButton />
      </div>

      <h1 className="text-4xl font-bold mb-2">Realtime Quiz</h1>
      <p className="text-white/50 mb-10">Test your knowledge. Challenge others.</p>

      <div className="space-y-4">
        <button
          onClick={() => setMode("single")}
          className="w-full bg-blue-600 hover:bg-blue-700 transition-all p-4 rounded-2xl font-semibold text-lg flex items-center justify-center gap-3"
        >
          <span className="text-2xl">🎯</span>
          Single Player
        </button>

        <button
          onClick={() => setMode("multi")}
          className="w-full bg-purple-600 hover:bg-purple-700 transition-all p-4 rounded-2xl font-semibold text-lg flex items-center justify-center gap-3"
        >
          <span className="text-2xl">⚔️</span>
          Multiplayer
        </button>

        <button
          onClick={() => router.push("/leaderboard")}
          className="w-full bg-white/10 hover:bg-white/20 transition-all p-4 rounded-2xl font-semibold text-lg flex items-center justify-center gap-3"
        >
          <span className="text-2xl">🏆</span>
          Global Leaderboard
        </button>
      </div>
    </div>
  );
}
