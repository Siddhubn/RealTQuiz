import {mutation,query} from "./_generated/server";
import {v} from "convex/values";

export const createUser= mutation({
    args:{
        name: v.string(),
        age: v.number()
    },

    handler: async (ctx,args)=>{
        const userId = await ctx.db.insert("users",{
            name: args.name,
            age: args.age,
            score:0,
            currentQuestion: 0,
            completed: false,
            quizStarted: true,
        });
        return userId;
    },
}); 

export const getUser=query({
    args:{
        userId: v.id("users"),
    },
    handler: async(ctx,args)=>{
        return await ctx.db.get(args.userId);
    },
});