"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn, signUp, authClient } from "@/lib/auth-client";
import toast from "react-hot-toast";
import {
  Eye, EyeOff, Mail, Lock, User,
  ArrowLeft, Loader2, CheckCircle2, Home,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Flow = "signIn" | "signUp" | "forgotPassword";
type OAuthProvider = "google" | "github";

interface Props {
  onSuccess: () => void;
  onClose: () => void;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface InputFieldProps {
  id: string;
  label: string;
  type: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete?: string;
  icon: React.ReactNode;
  rightElement?: React.ReactNode;
  minLength?: number;
  required?: boolean;
}

function InputField({
  id, label, type, placeholder, value, onChange,
  autoComplete, icon, rightElement, minLength, required,
}: InputFieldProps) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-white/70">
        {label}
      </label>
      <div className="relative">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none">
          {icon}
        </span>
        <input
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          minLength={minLength}
          required={required}
          className="
            w-full pl-10 pr-10 py-3 rounded-xl
            bg-white/5 border border-white/10
            text-white placeholder:text-white/25
            outline-none
            focus:border-indigo-500 focus:bg-white/[0.08] focus:ring-1 focus:ring-indigo-500/40
            transition-all duration-200 text-sm
          "
        />
        {rightElement && (
          <span className="absolute right-3.5 top-1/2 -translate-y-1/2">
            {rightElement}
          </span>
        )}
      </div>
    </div>
  );
}

function PasswordStrength({ password }: { password: string }) {
  if (!password) return null;
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ];
  const score = checks.filter(Boolean).length;
  const barColor = (i: number) => {
    if (score <= i) return "bg-white/10";
    return ["bg-red-500", "bg-orange-400", "bg-yellow-400", "bg-emerald-500"][score - 1];
  };
  const label  = ["", "Weak", "Fair", "Good", "Strong"][score];
  const lColor = ["", "text-red-400", "text-orange-400", "text-yellow-400", "text-emerald-400"][score];
  return (
    <div className="space-y-1.5">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${barColor(i)}`} />
        ))}
      </div>
      <p className={`text-xs ${lColor}`}>{label} password</p>
    </div>
  );
}

function ErrorAlert({ message }: { message: string }) {
  return (
    <div role="alert" className="flex items-start gap-2.5 bg-red-500/10 border border-red-500/30 rounded-xl p-3">
      <span className="text-red-400 mt-0.5 shrink-0">⚠</span>
      <p className="text-red-300 text-sm leading-snug">{message}</p>
    </div>
  );
}

// ─── OAuth buttons ────────────────────────────────────────────────────────────

const GoogleLogo = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4"/>
    <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
    <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05"/>
    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335"/>
  </svg>
);

const GitHubLogo = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.303 3.438 9.8 8.205 11.387.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222 0 1.606-.015 2.896-.015 3.286 0 .315.216.69.825.572C20.565 21.795 24 17.298 24 12c0-6.63-5.37-12-12-12Z"/>
  </svg>
);

interface OAuthButtonProps {
  provider: OAuthProvider;
  loading: boolean;
  onClick: () => void;
}

function OAuthButton({ provider, loading, onClick }: OAuthButtonProps) {
  const config = {
    google: {
      label: "Continue with Google",
      logo: <GoogleLogo />,
      className: "border-white/10 hover:border-white/20 hover:bg-white/5",
    },
    github: {
      label: "Continue with GitHub",
      logo: <GitHubLogo />,
      className: "border-white/10 hover:border-white/20 hover:bg-white/5",
    },
  }[provider];

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className={`
        w-full flex items-center justify-center gap-3
        py-2.5 px-4 rounded-xl border text-sm font-medium text-white/80
        transition-all duration-200 active:scale-[0.98]
        disabled:opacity-50 disabled:cursor-not-allowed
        ${config.className}
      `}
    >
      {loading ? <Loader2 size={16} className="animate-spin" /> : config.logo}
      {config.label}
    </button>
  );
}

// ─── Main modal ───────────────────────────────────────────────────────────────

export default function AuthModal({ onSuccess, onClose }: Props) {
  const [flow, setFlow] = useState<Flow>("signIn");
  const router = useRouter();

  // email/password fields
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [name, setName]         = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // forgot password
  const [resetEmail, setResetEmail] = useState("");
  const [resetSent, setResetSent]   = useState(false);

  // loading states — separate for each OAuth provider so buttons are independent
  const [emailLoading, setEmailLoading]   = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [githubLoading, setGithubLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const clearError = () => setError(null);

  const switchFlow = (next: Flow) => { setError(null); setFlow(next); };

  const anyLoading = emailLoading || googleLoading || githubLoading;

  // ── Email / password submit ────────────────────────────────────────────────

  const handleAuthSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    clearError();
    setEmailLoading(true);
    try {
      if (flow === "signUp") {
        const r = await signUp.email({ email: email.trim().toLowerCase(), password, name: name.trim() });
        if (r.error) throw new Error(r.error.message ?? "Sign up failed");
        toast.success("Account created — welcome aboard!");
      } else {
        const r = await signIn.email({ email: email.trim().toLowerCase(), password });
        if (r.error) throw new Error(r.error.message ?? "Invalid email or password");
        toast.success("Welcome back!");
      }
      onSuccess();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setEmailLoading(false);
    }
  };

  // ── OAuth ──────────────────────────────────────────────────────────────────

  const handleOAuth = async (provider: OAuthProvider) => {
    clearError();
    const setLoading = provider === "google" ? setGoogleLoading : setGithubLoading;
    setLoading(true);
    try {
      await signIn.social({
        provider,
        callbackURL: window.location.href, 
      });
      onSuccess();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : `${provider} sign-in failed`);
      setLoading(false);
    }
  };

  // ── Forgot password submit ─────────────────────────────────────────────────

  const handleForgotSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    clearError();
    setEmailLoading(true);
    try {
      const r = await authClient.requestPasswordReset({
        email: resetEmail.trim().toLowerCase(),
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (r.error) throw new Error(r.error.message ?? "Could not send reset email");
      setResetSent(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setEmailLoading(false);
    }
  };

  // ── Backdrop ───────────────────────────────────────────────────────────────

  const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/75 backdrop-blur-md"
      onClick={handleBackdrop}
    >
      <div
        className="relative w-full max-w-md bg-[#0d1117] border border-white/10 rounded-2xl shadow-2xl shadow-black/60 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Accent bar */}
        <div className="h-1 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

        <div className="p-8">

          {/* ── Header ── */}
          <div className="flex items-center justify-between mb-7">
            <div className="flex items-center gap-3">
              {flow === "forgotPassword" && (
                <button
                  onClick={() => switchFlow("signIn")}
                  aria-label="Back to sign in"
                  className="text-white/40 hover:text-white transition-colors p-1 -ml-1 rounded-lg hover:bg-white/5"
                >
                  <ArrowLeft size={18} />
                </button>
              )}
              <div>
                <h2 className="text-xl font-bold text-white leading-tight">
                  {flow === "signIn"        && "Welcome back"}
                  {flow === "signUp"        && "Create account"}
                  {flow === "forgotPassword" && "Reset password"}
                </h2>
                <p className="text-white/40 text-xs mt-0.5">
                  {flow === "signIn"        && "Sign in to your Realtime Quiz account"}
                  {flow === "signUp"        && "Join Realtime Quiz today"}
                  {flow === "forgotPassword" && "We'll send a reset link to your email"}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              aria-label="Close"
              className="text-white/30 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/5 shrink-0"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            </button>
          </div>

          {/* ── Forgot password flow ── */}
          {flow === "forgotPassword" ? (
            resetSent ? (
              <div className="text-center py-4 space-y-4">
                <div className="flex justify-center">
                  <div className="w-14 h-14 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
                    <CheckCircle2 size={28} className="text-emerald-400" />
                  </div>
                </div>
                <div>
                  <p className="text-white font-semibold text-lg">Check your inbox</p>
                  <p className="text-white/50 text-sm mt-1.5 leading-relaxed">
                    We sent a reset link to{" "}
                    <span className="text-white/80 font-medium">{resetEmail}</span>.
                    <br />Check your spam folder if you don't see it.
                  </p>
                </div>
                <button
                  onClick={() => { setResetSent(false); switchFlow("signIn"); }}
                  className="text-indigo-400 hover:text-indigo-300 text-sm transition-colors"
                >
                  Back to sign in
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-5" noValidate>
                <InputField
                  id="reset-email" label="Email address" type="email"
                  placeholder="you@example.com" value={resetEmail}
                  onChange={(v) => { setResetEmail(v); clearError(); }}
                  autoComplete="email" icon={<Mail size={16} />} required
                />
                {error && <ErrorAlert message={error} />}
                <button
                  type="submit" disabled={emailLoading}
                  className="w-full py-3 rounded-xl font-semibold text-sm bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
                >
                  {emailLoading ? <><Loader2 size={16} className="animate-spin" /> Sending…</> : "Send reset link"}
                </button>
              </form>
            )
          ) : (
            /* ── Sign in / Sign up flow ── */
            <>
              {/* Tab switcher */}
              <div className="flex bg-white/5 rounded-xl p-1 mb-6">
                {(["signIn", "signUp"] as const).map((f) => (
                  <button
                    key={f} type="button" onClick={() => switchFlow(f)}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      flow === f ? "bg-white/10 text-white shadow-sm" : "text-white/40 hover:text-white/70"
                    }`}
                  >
                    {f === "signIn" ? "Sign In" : "Sign Up"}
                  </button>
                ))}
              </div>

              {/* ── OAuth buttons ── */}
              <div className="space-y-2.5 mb-5">
                <OAuthButton
                  provider="google"
                  loading={googleLoading}
                  onClick={() => handleOAuth("google")}
                />
                <OAuthButton
                  provider="github"
                  loading={githubLoading}
                  onClick={() => handleOAuth("github")}
                />
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3 mb-5">
                <div className="flex-1 h-px bg-white/8" />
                <span className="text-white/25 text-xs">or continue with email</span>
                <div className="flex-1 h-px bg-white/8" />
              </div>

              {/* Email / password form */}
              <form onSubmit={handleAuthSubmit} className="space-y-4" noValidate>
                {flow === "signUp" && (
                  <InputField
                    id="auth-name" label="Display name" type="text"
                    placeholder="Your name" value={name}
                    onChange={(v) => { setName(v); clearError(); }}
                    autoComplete="name" icon={<User size={16} />} required
                  />
                )}

                <InputField
                  id="auth-email" label="Email address" type="email"
                  placeholder="you@example.com" value={email}
                  onChange={(v) => { setEmail(v); clearError(); }}
                  autoComplete={flow === "signIn" ? "email" : "new-email"}
                  icon={<Mail size={16} />} required
                />

                <div className="space-y-2">
                  <InputField
                    id="auth-password" label="Password"
                    type={showPassword ? "text" : "password"}
                    placeholder={flow === "signUp" ? "Min. 8 characters" : "Your password"}
                    value={password}
                    onChange={(v) => { setPassword(v); clearError(); }}
                    autoComplete={flow === "signIn" ? "current-password" : "new-password"}
                    icon={<Lock size={16} />} minLength={8} required
                    rightElement={
                      <button
                        type="button"
                        onClick={() => setShowPassword((s) => !s)}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        className="text-white/30 hover:text-white/70 transition-colors"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    }
                  />
                  {flow === "signUp" && <PasswordStrength password={password} />}
                </div>

                {flow === "signIn" && (
                  <div className="flex justify-end -mt-1">
                    <button
                      type="button" onClick={() => switchFlow("forgotPassword")}
                      className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                    >
                      Forgot password?
                    </button>
                  </div>
                )}

                {error && <ErrorAlert message={error} />}

                <button
                  type="submit" disabled={anyLoading}
                  className="w-full py-3 rounded-xl font-semibold text-sm mt-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
                >
                  {emailLoading ? (
                    <><Loader2 size={16} className="animate-spin" />
                      {flow === "signIn" ? "Signing in…" : "Creating account…"}
                    </>
                  ) : (
                    flow === "signIn" ? "Sign In" : "Create Account"
                  )}
                </button>
              </form>

              {/* Toggle flow text */}
              <p className="text-center text-white/40 text-sm mt-5">
                {flow === "signIn" ? "Don't have an account?" : "Already have an account?"}{" "}
                <button
                  type="button"
                  onClick={() => switchFlow(flow === "signIn" ? "signUp" : "signIn")}
                  className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
                >
                  {flow === "signIn" ? "Sign up free" : "Sign in"}
                </button>
              </p>
            </>
          )}
        </div>

        {/* ── Return to homepage ── */}
        <div className="px-8 pb-6 -mt-2">
          <button
            type="button"
            onClick={() => { onClose(); router.push("/"); }}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm text-white/35 border border-white/8 hover:border-white/15 hover:text-white/60 hover:bg-white/[0.04] transition-all duration-200"
          >
            <Home size={14} />
            Return to homepage
          </button>
        </div>
      </div>
    </div>
  );
}
