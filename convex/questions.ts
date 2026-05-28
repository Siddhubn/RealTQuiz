import {mutation,query} from "./_generated/server";
import {v} from "convex/values";

// Question Generation Mutation
export const generateQuizQuestions=mutation({
    args:{
        userId: v.id("users"),
        questions: v.array(
            v.object({
                question: v.string(),
                options: v.array(v.string()),
                correctAnswer: v.string(),
        })
        ),
    },

    handler: async (convexToJson, args)=>{
        for(let i=0;i<args.questions.length;i++){
            const q=args.questions[i];

            await convexToJson.db.insert("questions",{
                userId: args.userId,
                question: q.question,
                options: q.options,
                correctAnswer: q.correctAnswer,
                questionNumber: i + 1,
            });
        }
        return true;
        }
    }
)

// Query to Fetch Current Question
export const getCurrentQuestion = query({
  args: {
    userId: v.id("users"),
  },

  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);

    if (!user) {
      return null;
    }

    const questions = await ctx.db
      .query("questions")
      .filter((q) =>
        q.eq(
          q.field("userId"),
          args.userId
        )
      )
      .collect();

    const sortedQuestions =
      questions.sort(
        (a, b) =>
          a.questionNumber -
          b.questionNumber
      );

    const currentQuestion =
      sortedQuestions[
        user.currentQuestion
      ];

    return {
      question: currentQuestion || null,

      currentQuestionIndex:
        user.currentQuestion,

      score: user.score,

      completed: user.completed,
    };
  },
});

// Answer Submission Mutation
export const submitAnswer = mutation({
    args: {
        userId: v.id("users"),
        questionId: v.id("questions"),
        selectedAnswer: v.string(),
    },
    handler: async (ctx, args) => {
        const user = await ctx.db.get(args.userId);

        if(!user){
            throw new Error("User not found");
        }

        const question = await ctx.db.get(args.questionId);

        if(!question){
            throw new Error("Question not found");
        }

        const alreadyAnswered = await ctx.db
            .query("attempts")
            .filter((q)=>
                q.eq(q.field("questionId"),args.questionId)
            )
            .first();
        
            if(alreadyAnswered){
                throw new Error("Already answered");
            }

            const isCorrect = question.correctAnswer === args.selectedAnswer;

            await ctx.db.insert("attempts",{
                userId: args.userId,
                questionId: args.questionId,
                selectedAnswer: args.selectedAnswer,
                isCorrect,
            });

            await ctx.db.patch(args.userId,{
                score: isCorrect
                ? user.score+1
                : user.score,

                currentQuestion: user.currentQuestion+1,

                completed: user.currentQuestion+1>=10,
            });
            return {
                correct: isCorrect,
                correctAnswer: question.correctAnswer,
            };
    },
});

