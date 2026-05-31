"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const router = useRouter();

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#050816] text-white px-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="text-6xl">⚠️</div>
        <h1 className="text-2xl font-bold">Something went wrong</h1>
        <p className="text-white/50 text-sm leading-relaxed">
          An unexpected error occurred. You can try again or return to the homepage.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="bg-white/10 hover:bg-white/20 transition-all px-5 py-2.5 rounded-xl font-semibold text-sm"
          >
            Try again
          </button>
          <button
            onClick={() => router.push("/")}
            className="bg-blue-600 hover:bg-blue-700 transition-all px-5 py-2.5 rounded-xl font-semibold text-sm"
          >
            Go home
          </button>
        </div>
      </div>
    </main>
  );
}
