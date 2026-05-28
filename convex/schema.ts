import {defineSchema,defineTable} from "convex/server";
import {v} from "convex/values";

export default defineSchema({
    users: defineTable({
        name: v.string(),
        age: v.number(),
        score: v.number(),
        currentQuestion: v.number(),
        completed: v.boolean(),
        quizStarted: v.boolean(),
        mode: v.optional(v.union(v.literal("single"), v.literal("multi"))),
        roomId: v.optional(v.id("rooms")),
        startedAt: v.optional(v.number()),
        finishedAt: v.optional(v.number()),
    }),

    questions: defineTable({
        userId: v.optional(v.id("users")),
        roomId: v.optional(v.id("rooms")),
        question: v.string(),
        options: v.array(v.string()),
        correctAnswer: v.string(),
        questionNumber: v.number(),
    }),

    attempts: defineTable({
        userId: v.id("users"),
        questionId: v.id("questions"),
        selectedAnswer: v.string(),
        isCorrect: v.boolean(),
    }),

    rooms: defineTable({
        code: v.string(),
        hostUserId: v.id("users"),
        status: v.union(
            v.literal("waiting"),
            v.literal("active"),
            v.literal("finished")
        ),
        createdAt: v.number(),
    }).index("by_code", ["code"]),

    roomMembers: defineTable({
        roomId: v.id("rooms"),
        userId: v.id("users"),
    }).index("by_room", ["roomId"])
      .index("by_user", ["userId"]),

    globalLeaderboard: defineTable({
        userId: v.id("users"),
        name: v.string(),
        score: v.number(),
        timeTaken: v.number(),
        completedAt: v.number(),
    }).index("by_score", ["score"]),
});
