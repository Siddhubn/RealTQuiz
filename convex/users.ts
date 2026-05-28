import {mutation, query} from "./_generated/server";
import {v} from "convex/values";

export const createUser = mutation({
    args: {
        name: v.string(),
        age: v.number(),
        mode: v.union(v.literal("single"), v.literal("multi")),
        roomId: v.optional(v.id("rooms")),
    },
    handler: async (ctx, args) => {
        const userId = await ctx.db.insert("users", {
            name: args.name,
            age: args.age,
            score: 0,
            currentQuestion: 0,
            completed: false,
            quizStarted: true,
            mode: args.mode,
            roomId: args.roomId,
            startedAt: Date.now(),
        });
        return userId;
    },
});

export const getUser = query({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.userId);
    },
});

export const markFinished = mutation({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        const user = await ctx.db.get(args.userId);
        if (!user) return;

        if (user.finishedAt) return;

        const now = Date.now();
        await ctx.db.patch(args.userId, { finishedAt: now });

        if (user.mode === "single") {
            const existing = await ctx.db
                .query("globalLeaderboard")
                .filter((q) => q.eq(q.field("userId"), args.userId))
                .first();

            if (!existing) {
                const timeTaken = user.startedAt
                    ? Math.round((now - user.startedAt) / 1000)
                    : 0;
                await ctx.db.insert("globalLeaderboard", {
                    userId: args.userId,
                    name: user.name,
                    score: user.score,
                    timeTaken,
                    completedAt: now,
                });
            }
        }
    },
});
