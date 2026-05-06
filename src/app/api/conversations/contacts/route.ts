import { NextRequest, NextResponse } from "next/server";
import { connectDB, User, Conversation } from "@/app/lib/db";
import { getUserIdFromRequest } from "@/app/lib/db/getUserIdFromRequest";

// GET /api/conversations/contacts — fetch all contacts/conversations for the logged-in user
export async function GET(req: NextRequest) {
  const userId = getUserIdFromRequest(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await connectDB();

    const conversations = await Conversation.find({ participants: userId })
      .populate({
        path: "participants",
        select: "username avatar isOnline lastSeen",
        match: { _id: { $ne: userId } }, // Exclude the current user
      })
      .populate("lastMessage")
      .sort({ lastMessageAt: -1 });

    // Extract unique contacts from conversations
    const contactMap = new Map();
    conversations.forEach((conv) => {
      conv.participants.forEach((participant: any) => {
        if (participant._id.toString() !== userId) {
          contactMap.set(participant._id.toString(), participant);
        }
      });
    });

    const contacts = Array.from(contactMap.values());

    return NextResponse.json({ contacts, conversations }, { status: 200 });
  } catch (err) {
    console.error("[GET /conversations/contacts]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
