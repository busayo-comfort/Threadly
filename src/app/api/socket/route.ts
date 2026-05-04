import { NextResponse } from "next/server";

// Socket.io is mounted at this path on the custom server.
// This route just keeps Next.js happy if anyone hits it directly.
export async function GET() {
  return NextResponse.json({ status: "Socket server running" });
}