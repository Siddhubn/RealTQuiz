import {defineSchema,defineTable} from "convex/server";
import {v} from "convex/values";

export default defineSchema(
    {
        users: defineTable({
            name: v.string(),
            age: v.number(),
            score: v.number(),
            currentQuestion: v.number(),
            completed: v.boolean(),
            quizStarted: v.boolean()
        }),

        questions: defineTable({
            userId: v.id("users"),
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
    }
);