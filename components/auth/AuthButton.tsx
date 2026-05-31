"use client";

import { useState } from "react";
import { useSession, signOut } from "@/lib/auth-client";
import AuthModal from "./AuthModal";
import toast from "react-hot-toast";
import { LogOut, UserCircle2 } from "lucide-react";

export default function AuthButton() {
  const { data: session, isPending } = useSession();
  const [showModal, setShowModal] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out");
  };

  // Loading skeleton
  if (isPending) {
    return <div className="h-8 w-28 rounded-lg bg-white/10 animate-pulse" />;
  }

  // Signed in state
  if (session?.user) {
    return (
      <div className="flex items-center gap-2.5">
        <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5">
          <UserCircle2 size={15} className="text-indigo-400 shrink-0" />
          <span
            className="text-white/70 text-sm truncate max-w-[120px]"
            title={session.user.email}
          >
            {session.user.name ?? session.user.email}
          </span>
        </div>
        <button
          onClick={handleSignOut}
          aria-label="Sign out"
          title="Sign out"
          className="
            flex items-center gap-1.5 text-sm text-white/40
            hover:text-red-400 transition-colors
            bg-white/5 border border-white/10 rounded-xl px-3 py-1.5
            hover:border-red-500/30 hover:bg-red-500/5
          "
        >
          <LogOut size={14} />
          <span className="hidden sm:inline">Sign out</span>
        </button>
      </div>
    );
  }

  // Signed out state
  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="
          text-sm font-medium
          bg-gradient-to-r from-indigo-600 to-purple-600
          hover:from-indigo-500 hover:to-purple-500
          px-4 py-2 rounded-xl
          transition-all duration-200 active:scale-95
          shadow-lg shadow-indigo-900/30
        "
      >
        Sign in
      </button>

      {showModal && (
        <AuthModal
          onSuccess={() => setShowModal(false)}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}
