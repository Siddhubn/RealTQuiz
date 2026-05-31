import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

// Force dynamic so Next.js never tries to statically render this route
export const dynamic = "force-dynamic";

export const { GET, POST } = toNextJsHandler(auth);
