import { betterAuth } from "better-auth";
import path from "path";

function createDatabase() {
  if (process.env.DATABASE_URL) {
    const { Pool } = require("pg");
    return new Pool({ connectionString: process.env.DATABASE_URL });
  }

  const Database = require("better-sqlite3");
  const dbPath = path.join(process.cwd(), "auth.db");
  return new Database(dbPath);
}

export const auth = betterAuth({
  database: createDatabase(),

  secret: process.env.BETTER_AUTH_SECRET,

  baseURL: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",

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
      // Ensures email is shared even if the user has no public email on GitHub
      scope: ["user:email"],
    },
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge:  60 * 60 * 24,     // refresh if older than 1 day
    cookieCache: {
      enabled: true,
      maxAge:  60 * 5,            // 5-minute client-side cache
    },
  },

  rateLimit: {
    enabled: true,
    window: 60, // seconds
    max: 10,    // requests per window per IP
  },

  trustedOrigins: [
    "http://localhost:3000",
    "https://real-t-quiz-gia5.vercel.app",
  ],
});

export type Session = typeof auth.$Infer.Session;
export type User    = typeof auth.$Infer.Session.user;
