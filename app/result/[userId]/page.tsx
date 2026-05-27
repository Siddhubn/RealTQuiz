"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

interface Props {
  params: {
    userId: string;
  };
}

export default function ResultPage({
  params,
}: Props) {
  const user = useQuery(
    api.users.getUser,
    {
      userId: params.userId as any,
    }
  );

  if (!user) {
    return (
      <main className="min-h-screen flex items-center justify-center text-white">
        Loading...
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#050816] text-white px-4">
      <div className="w-full max-w-xl bg-white/10 p-10 rounded-2xl text-center">
        <h1 className="text-5xl font-bold mb-6">
          Quiz Completed !
        </h1>

        <p className="text-2xl mb-4">
          {user.name}
        </p>

        <div className="text-7xl font-bold mb-8">
          {user.score}/10
        </div>

        <button
          onClick={() =>
            window.location.href = "/"
          }
          className="bg-blue-600 hover:bg-blue-700 px-8 py-4 rounded-xl"
        >
          Play Again
        </button>
      </div>
    </main>
  );
}