import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB, Message, Conversation } from "@/app/lib/db";
import { getUserIdFromRequest } from "@/app/lib/db/getUserIdFromRequest";


// GET /api/conversations/[id]/messages?page=1&limit=50
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = getUserIdFromRequest(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await connectDB();

        const { id: conversationId } = await params;
    // Verify user is a participant
    const convo = await Conversation.findOne({
      _id: conversationId,
      participants: userId,
    });

    if (!convo) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const page  = Math.max(1, parseInt(searchParams.get("page")  || "1"));
    const limit = Math.min(100, parseInt(searchParams.get("limit") || "50"));
    const skip  = (page - 1) * limit;

    const [messages, total] = await Promise.all([
      Message.find({ conversationId: conversationId })
        .populate("sender", "username avatar")
        .sort({ createdAt: -1 })  // newest first
        .skip(skip)
        .limit(limit),
      Message.countDocuments({ conversationId: conversationId }),
    ]);

    return NextResponse.json(
      {
        messages: messages.reverse(), // return oldest-first for UI
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasMore: skip + limit < total,
        },
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("[GET /conversations/[id]/messages]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}