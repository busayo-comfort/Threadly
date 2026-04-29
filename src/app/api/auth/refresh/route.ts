import { NextRequest, NextResponse } from "next/server";
import { verifyRefreshToken, signAccessToken } from "../jwt";

export async function GET(req: NextRequest) {
  try {
    const refreshToken = req.cookies.get("refreshToken")?.value;

    if (!refreshToken) {
      return NextResponse.json(
        { error: "No refresh token" },
        { status: 401 }
      );
    }

    const { userId } = verifyRefreshToken(refreshToken);
    const accessToken = signAccessToken(userId);

    return NextResponse.json({ accessToken }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Invalid or expired refresh token" },
      { status: 401 }
    );
  }
}