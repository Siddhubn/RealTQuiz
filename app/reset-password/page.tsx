"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import toast from "react-hot-toast";
import { Lock, Eye, EyeOff, Loader2, CheckCircle2, AlertCircle, Home } from "lucide-react";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  // If no token in URL, show an error immediately
  const invalidToken = !token;

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }

    setLoading(true);
    try {
      const result = await authClient.resetPassword({
        newPassword: password,
        token: token!,
      });
      if (result.error) throw new Error(result.error.message ?? "Reset failed");
      setDone(true);
      toast.success("Password updated!");
      setTimeout(() => router.push("/"), 2500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (invalidToken) {
    return (
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="w-14 h-14 rounded-full bg-red-500/15 border border-red-500/30 flex items-center justify-center">
            <AlertCircle size={28} className="text-red-400" />
          </div>
        </div>
        <div>
          <p className="text-white font-semibold text-lg">Invalid reset link</p>
          <p className="text-white/50 text-sm mt-1.5">
            This link is missing a token. Please request a new password reset.
          </p>
        </div>
        <button
          onClick={() => router.push("/")}
          className="text-indigo-400 hover:text-indigo-300 text-sm transition-colors"
        >
          Back to home
        </button>
      </div>
    );
  }

  if (done) {
    return (
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="w-14 h-14 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
            <CheckCircle2 size={28} className="text-emerald-400" />
          </div>
        </div>
        <div>
          <p className="text-white font-semibold text-lg">Password updated</p>
          <p className="text-white/50 text-sm mt-1.5">
            Redirecting you back to the app…
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {/* New password */}
      <div className="space-y-1.5">
        <label htmlFor="new-password" className="block text-sm font-medium text-white/70">
          New password
        </label>
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none">
            <Lock size={16} />
          </span>
          <input
            id="new-password"
            type={showPassword ? "text" : "password"}
            placeholder="Min. 8 characters"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(null); }}
            autoComplete="new-password"
            minLength={8}
            required
            className="
              w-full pl-10 pr-10 py-3 rounded-xl
              bg-white/5 border border-white/10
              text-white placeholder:text-white/25
              outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/40
              transition-all duration-200 text-sm
            "
          />
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      {/* Confirm password */}
      <div className="space-y-1.5">
        <label htmlFor="confirm-password" className="block text-sm font-medium text-white/70">
          Confirm password
        </label>
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none">
            <Lock size={16} />
          </span>
          <input
            id="confirm-password"
            type={showConfirm ? "text" : "password"}
            placeholder="Repeat your password"
            value={confirm}
            onChange={(e) => { setConfirm(e.target.value); setError(null); }}
            autoComplete="new-password"
            required
            className="
              w-full pl-10 pr-10 py-3 rounded-xl
              bg-white/5 border border-white/10
              text-white placeholder:text-white/25
              outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/40
              transition-all duration-200 text-sm
            "
          />
          <button
            type="button"
            onClick={() => setShowConfirm((s) => !s)}
            aria-label={showConfirm ? "Hide password" : "Show password"}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors"
          >
            {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {/* Match indicator */}
        {confirm && (
          <p className={`text-xs ${password === confirm ? "text-emerald-400" : "text-red-400"}`}>
            {password === confirm ? "✓ Passwords match" : "✗ Passwords don't match"}
          </p>
        )}
      </div>

      {error && (
        <div role="alert" className="flex items-start gap-2.5 bg-red-500/10 border border-red-500/30 rounded-xl p-3">
          <span className="text-red-400 mt-0.5 shrink-0">⚠</span>
          <p className="text-red-300 text-sm leading-snug">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="
          w-full py-3 rounded-xl font-semibold text-sm
          bg-gradient-to-r from-indigo-600 to-purple-600
          hover:from-indigo-500 hover:to-purple-500
          active:scale-[0.98]
          disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100
          transition-all duration-200
          flex items-center justify-center gap-2
        "
      >
        {loading ? (
          <><Loader2 size={16} className="animate-spin" /> Updating…</>
        ) : (
          "Set new password"
        )}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#050816] px-4">
      <div className="w-full max-w-md bg-[#0d1117] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
        {/* Top accent bar */}
        <div className="h-1 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

        <div className="p-8">
          {/* Header row with title + homepage button */}
          <div className="flex items-start justify-between mb-7">
            <div>
              <h1 className="text-xl font-bold text-white">Set new password</h1>
              <p className="text-white/40 text-xs mt-0.5">Choose a strong password for your account</p>
            </div>
            <button
              onClick={() => router.push("/")}
              aria-label="Return to homepage"
              title="Return to homepage"
              className="
                flex items-center gap-1.5 shrink-0 ml-4
                text-xs text-white/35 hover:text-white/70
                border border-white/8 hover:border-white/20
                bg-white/3 hover:bg-white/6
                px-3 py-1.5 rounded-lg
                transition-all duration-200
              "
            >
              <Home size={13} />
              <span>Home</span>
            </button>
          </div>

          <Suspense fallback={
            <div className="flex justify-center py-8">
              <Loader2 size={24} className="animate-spin text-white/30" />
            </div>
          }>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
