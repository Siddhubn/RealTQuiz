import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

/**
 * Handles all better-auth endpoints under /api/auth/*
 *
 * Examples:
 *   POST /api/auth/sign-up/email
 *   POST /api/auth/sign-in/email
 *   POST /api/auth/sign-out
 *   GET  /api/auth/session
 *   GET  /api/auth/get-session
 */
export const { GET, POST } = toNextJsHandler(auth);
