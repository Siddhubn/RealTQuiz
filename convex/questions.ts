import {mutation, query} from "./_generated/server";
import {v} from "convex/values";

export const generateQuizQuestions = mutation({
    args: {
        userId: v.optional(v.id("users")),
        roomId: v.optional(v.id("rooms")),
        questions: v.array(v.object({
            question: v.string(),
            options: v.array(v.string()),
            correctAnswer: v.string(),
        })),
    },
    handler: async (ctx, args) => {
        for (let i = 0; i < args.questions.length; i++) {
            const q = args.questions[i];
            await ctx.db.insert("questions", {
                userId: args.userId,
                roomId: args.roomId,
                question: q.question,
                options: q.options,
                correctAnswer: q.correctAnswer,
                questionNumber: i + 1,
            });
        }
        return true;
    },
});

export const getCurrentQuestion = query({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        const user = await ctx.db.get(args.userId);
        if (!user) return null;

        let questions;

        if (user.roomId) {
            questions = await ctx.db
                .query("questions")
                .filter((q) => q.eq(q.field("roomId"), user.roomId))
                .collect();

            if (questions.length === 0) {
                return {
                    question: null,
                    currentQuestionIndex: user.currentQuestion,
                    score: user.score,
                    completed: user.completed,
                    waiting: true,
                };
            }
        } else {
            questions = await ctx.db
                .query("questions")
                .filter((q) => q.eq(q.field("userId"), args.userId))
                .collect();
        }

        const sorted = questions.sort((a, b) => a.questionNumber - b.questionNumber);
        const currentQuestion = sorted[user.currentQuestion] || null;

        return {
            question: currentQuestion,
            currentQuestionIndex: user.currentQuestion,
            score: user.score,
            completed: user.completed,
            waiting: false,
        };
    },
});

export const submitAnswer = mutation({
    args: {
        userId: v.id("users"),
        questionId: v.id("questions"),
        selectedAnswer: v.string(),
    },
    handler: async (ctx, args) => {
        const user = await ctx.db.get(args.userId);
        if (!user) throw new Error("User not found");

        const question = await ctx.db.get(args.questionId);
        if (!question) throw new Error("Question not found");

        const alreadyAnswered = await ctx.db
            .query("attempts")
            .filter((q) => q.and(
                q.eq(q.field("userId"), args.userId),
                q.eq(q.field("questionId"), args.questionId)
            ))
            .first();

        if (alreadyAnswered) {
            return { correct: alreadyAnswered.isCorrect, correctAnswer: question.correctAnswer };
        }

        const isCorrect = question.correctAnswer === args.selectedAnswer;

        await ctx.db.insert("attempts", {
            userId: args.userId,
            questionId: args.questionId,
            selectedAnswer: args.selectedAnswer,
            isCorrect,
        });

        const newCurrentQuestion = user.currentQuestion + 1;
        const completed = newCurrentQuestion >= 10;

        await ctx.db.patch(args.userId, {
            score: isCorrect ? user.score + 1 : user.score,
            currentQuestion: newCurrentQuestion,
            completed,
        });

        return { correct: isCorrect, correctAnswer: question.correctAnswer };
    },
});
