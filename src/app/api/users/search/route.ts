import { NextRequest, NextResponse } from "next/server";
import { connectDB, User } from "@/app/lib/db";
import { getUserIdFromRequest } from "@/app/lib/db/getUserIdFromRequest";

export async function GET(req: NextRequest) {
  const currentUserId = getUserIdFromRequest(req);
  if (!currentUserId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q")?.trim();

  if (!query || query.length < 2) {
    return NextResponse.json({ users: [] });
  }

  try {
    await connectDB();

    const users = await User.find({
      _id: { $ne: currentUserId },           // exclude self
      $or: [
        { username: { $regex: query, $options: "i" } },
        { email: { $regex: query, $options: "i" } },
      ],
    })
      .select("username email avatar isOnline lastSeen")
      .limit(10);

    return NextResponse.json({ success: true, users });
  } catch (err) {
    console.error("[GET /users/search]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}