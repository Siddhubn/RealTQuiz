import { betterAuth } from "better-auth";
import path from "path";

function createDatabase() {
  if (process.env.DATABASE_URL) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { Pool } = require("pg");
    return new Pool({ connectionString: process.env.DATABASE_URL });
  }
  const Database = require("better-sqlite3");
  return new Database(path.join(process.cwd(), "auth.db"));
}

function createAuth() {
  return betterAuth({
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
}

let _instance: any = null;

function getInstance(): any {
  if (!_instance) _instance = createAuth();
  return _instance;
}

export const auth = new Proxy({} as ReturnType<typeof createAuth>, {
  get(_t, prop) { return getInstance()[prop]; },
});

export type Session = ReturnType<typeof createAuth>["$Infer"]["Session"];
export type User    = ReturnType<typeof createAuth>["$Infer"]["Session"]["user"];
