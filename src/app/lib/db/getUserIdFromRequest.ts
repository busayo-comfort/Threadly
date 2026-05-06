import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

export function getUserIdFromRequest(req: NextRequest): string | null {
  // Try to get token from Authorization header first
  const authHeader = req.headers.get("Authorization");
  let token: string | null = null;

  if (authHeader?.startsWith("Bearer ")) {
    token = authHeader.slice(7); // Remove "Bearer " prefix
  }

  // Fallback to cookies if no Authorization header
  if (!token) {
    token = req.cookies.get("token")?.value || req.cookies.get("accessToken")?.value || null;
  }

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