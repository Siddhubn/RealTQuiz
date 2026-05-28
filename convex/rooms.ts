import {mutation, query} from "./_generated/server";
import {v} from "convex/values";

function generateRoomCode(): string {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "";
    for (let i = 0; i < 6; i++) {
        code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
}

export const createRoom = mutation({
    args: { hostUserId: v.id("users") },
    handler: async (ctx, args) => {
        let code = generateRoomCode();
        let existing = await ctx.db
            .query("rooms")
            .withIndex("by_code", (q) => q.eq("code", code))
            .first();
        while (existing) {
            code = generateRoomCode();
            existing = await ctx.db
                .query("rooms")
                .withIndex("by_code", (q) => q.eq("code", code))
                .first();
        }

        const roomId = await ctx.db.insert("rooms", {
            code,
            hostUserId: args.hostUserId,
            status: "waiting",
            createdAt: Date.now(),
        });

        await ctx.db.insert("roomMembers", {
            roomId,
            userId: args.hostUserId,
        });

        await ctx.db.patch(args.hostUserId, { roomId });

        return { roomId, code };
    },
});

export const joinRoom = mutation({
    args: {
        code: v.string(),
        userId: v.id("users"),
    },
    handler: async (ctx, args) => {
        const room = await ctx.db
            .query("rooms")
            .withIndex("by_code", (q) => q.eq("code", args.code.toUpperCase()))
            .first();

        if (!room) throw new Error("Room not found");
        if (room.status !== "waiting") throw new Error("Room already started");

        const alreadyMember = await ctx.db
            .query("roomMembers")
            .withIndex("by_room", (q) => q.eq("roomId", room._id))
            .filter((q) => q.eq(q.field("userId"), args.userId))
            .first();

        if (!alreadyMember) {
            await ctx.db.insert("roomMembers", {
                roomId: room._id,
                userId: args.userId,
            });
        }

        await ctx.db.patch(args.userId, { roomId: room._id });

        return { roomId: room._id, code: room.code };
    },
});

export const startRoom = mutation({
    args: { roomId: v.id("rooms") },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.roomId, { status: "active" });
    },
});

export const finishRoom = mutation({
    args: { roomId: v.id("rooms") },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.roomId, { status: "finished" });
    },
});

export const getRoom = query({
    args: { roomId: v.id("rooms") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.roomId);
    },
});

export const getRoomByCode = query({
    args: { code: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("rooms")
            .withIndex("by_code", (q) => q.eq("code", args.code.toUpperCase()))
            .first();
    },
});

export const getRoomMembers = query({
    args: { roomId: v.id("rooms") },
    handler: async (ctx, args) => {
        const members = await ctx.db
            .query("roomMembers")
            .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
            .collect();

        const users = await Promise.all(
            members.map((m) => ctx.db.get(m.userId))
        );

        return users
            .filter(Boolean)
            .map((u) => ({
                _id: u!._id,
                name: u!.name,
                score: u!.score,
                currentQuestion: u!.currentQuestion,
                completed: u!.completed,
            }))
            .sort((a, b) => b.score - a.score);
    },
});

export const getActiveRooms = query({
    args: {},
    handler: async (ctx) => {
        const rooms = await ctx.db
            .query("rooms")
            .filter((q) => q.eq(q.field("status"), "waiting"))
            .order("desc")
            .take(10);
        return rooms;
    },
});
