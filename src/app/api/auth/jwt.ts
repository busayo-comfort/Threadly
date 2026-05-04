import jwt from "jsonwebtoken";

const SECRET = process.env.ACCESS_TOKEN_SECRET as string;
const REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET as string;

if (!SECRET || !REFRESH_SECRET) throw new Error("JWT secrets are not defined in .env");

export function signAccessToken(userId: string) {
  return jwt.sign({ userId }, SECRET, { expiresIn: "15m" });
}

export function signRefreshToken(userId: string) {
  return jwt.sign({ userId }, REFRESH_SECRET, { expiresIn: "7d" });
}

export function verifyAccessToken(token: string) {
  return jwt.verify(token, SECRET) as { userId: string };
}

export function verifyRefreshToken(token: string) {
  return jwt.verify(token, REFRESH_SECRET) as { userId: string };
}