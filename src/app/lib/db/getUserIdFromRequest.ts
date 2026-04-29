import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";


export function getUserIdFromRequest(req: NextRequest): string | null {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  try {
    const payload = jwt.verify(
      auth.slice(7),
      process.env.ACCESS_TOKEN_SECRET!
    ) as { userId: string };
    return payload.userId;
  } catch {
    return null;
  }
}