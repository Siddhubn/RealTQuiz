// This file is intentionally minimal.
// Authentication is handled by better-auth via Next.js Route Handlers.
// See: lib/auth.ts and app/api/auth/[...all]/route.ts
//
// Convex functions use the authUserId stored in the users table
// (set after sign-in) rather than Convex's own auth system.
