import {query} from "./_generated/server";
import {v} from "convex/values";

export const getGlobalLeaderboard = query({
    args: {},
    handler: async (ctx) => {
        const entries = await ctx.db
            .query("globalLeaderboard")
            .withIndex("by_score")
            .order("desc")
            .take(50);
        return entries;
    },
});

export const getUserAttempts = query({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("globalLeaderboard")
            .filter((q) => q.eq(q.field("userId"), args.userId))
            .order("desc")
            .take(10);
    },
});
