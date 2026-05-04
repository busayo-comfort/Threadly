import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

export function getUserIdFromRequest(req: NextRequest): string | null {
  const token = req.cookies.get("token")?.value;

  if (!token) return null;

  try {
    const payload = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET!
    ) as { userId: string };

    return payload.userId;
  } catch {
    return null;
  }
}