import { NextResponse } from "next/server";
import { connectDB, User } from "@/app/lib/db";
import { verifyAccessToken } from "../jwt";

export async function POST(req: Request) {
  try {
    await connectDB();

    const authHeader = req.headers.get("authorization");
    const token = authHeader?.split(" ")[1];

    if (token) {
      const { userId } = verifyAccessToken(token);
      await User.findByIdAndUpdate(userId, {
        isOnline: false,
        lastSeen: new Date(),
      });
    }

    const response = NextResponse.json(
      { message: "Logged out successfully" },
      { status: 200 }
    );

    response.cookies.delete("refreshToken");
    return response;
  } catch {
    // Even if token is invalid, clear the cookie
    const response = NextResponse.json(
      { message: "Logged out" },
      { status: 200 }
    );
    response.cookies.delete("refreshToken");
    return response;
  }
}