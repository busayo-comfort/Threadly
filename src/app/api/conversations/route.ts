import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB, User, Conversation } from "@/app/lib/db";
import { getUserIdFromRequest } from "@/app/lib/db/getUserIdFromRequest";


// GET /api/conversations — list all conversations for the logged-in user
export async function GET(req: NextRequest) {
  const userId = getUserIdFromRequest(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await connectDB();

    const conversations = await Conversation.find({ participants: userId })
      .populate("participants", "username avatar isOnline lastSeen")
      .populate("lastMessage")
      .sort({ lastMessageAt: -1 });

    return NextResponse.json({ conversations }, { status: 200 });
  } catch (err) {
    console.error("[GET /conversations]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/conversations — find or create a conversation with another user
export async function POST(req: NextRequest) {
  const userId = getUserIdFromRequest(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await connectDB();
    const { targetUserId } = await req.json();

    if (!targetUserId) {
      return NextResponse.json({ error: "targetUserId is required" }, { status: 400 });
    }

    if (targetUserId === userId) {
      return NextResponse.json({ error: "Cannot chat with yourself" }, { status: 400 });
    }

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if conversation already exists between these two users
    let conversation = await Conversation.findOne({
      participants: { $all: [userId, targetUserId], $size: 2 },
    })
      .populate("participants", "username avatar isOnline lastSeen")
      .populate("lastMessage");

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [userId, targetUserId],
      });

      // Add to both users' conversations array
      await User.updateMany(
        { _id: { $in: [userId, targetUserId] } },
        { $addToSet: { conversations: conversation._id } }
      );

      conversation = await conversation.populate(
        "participants",
        "username avatar isOnline lastSeen"
      );
    }

    return NextResponse.json({ conversation }, { status: 200 });
  } catch (err) {
    console.error("[POST /conversations]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}