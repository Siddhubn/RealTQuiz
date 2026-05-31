import { betterAuth } from "better-auth";
import path from "path";

// ─── Database ─────────────────────────────────────────────────────────────────
// Production  → Neon Postgres  (DATABASE_URL set on Vercel)
// Development → local SQLite   (auth.db at project root)

function createDatabase() {
  if (process.env.DATABASE_URL) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { Pool } = require("pg");
    return new Pool({ connectionString: process.env.DATABASE_URL });
  }
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const Database = require("better-sqlite3");
  return new Database(path.join(process.cwd(), "auth.db"));
}

// ─── Auth instance ────────────────────────────────────────────────────────────
// Created once at module load time.
// The Proxy approach broke Vercel's production bundle (minifier inlines
// internal method references that the proxy can't intercept correctly).
// A direct singleton is simpler and works in all environments.

export const auth = betterAuth({
  database: createDatabase(),
  secret:   process.env.BETTER_AUTH_SECRET,
  baseURL:  process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    minPasswordLength: 8,
  },

  socialProviders: {
    google: {
      clientId:     process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
    github: {
      clientId:     process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      scope: ["user:email"],
    },
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge:  60 * 60 * 24,
    cookieCache: { enabled: true, maxAge: 60 * 5 },
  },

  rateLimit: { enabled: true, window: 60, max: 10 },

  trustedOrigins: [
    "http://localhost:3000",
    "https://real-t-quiz-gia5.vercel.app",
  ],
});

export type Session = typeof auth.$Infer.Session;
export type User    = typeof auth.$Infer.Session.user;
