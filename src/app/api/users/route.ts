import { NextRequest, NextResponse } from "next/server";
import { connectDB, User } from "@/app/lib/db";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const users = await User.find({}).select("-password");

    return NextResponse.json(
      {
        success: true,
        data: users,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch users",
      },
      { status: 500 }
    );
  }
}
