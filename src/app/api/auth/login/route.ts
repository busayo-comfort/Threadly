import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB, User } from "@/app/lib/db";
import { signAccessToken, signRefreshToken } from "../jwt";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Explicitly select password since it's hidden by default
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Mark user as online
    user.isOnline = true;
    user.lastSeen = new Date();
    await user.save();

    const accessToken = signAccessToken(user._id.toString());
    const refreshToken = signRefreshToken(user._id.toString());

    const response = NextResponse.json(
      {
        message: "Login successful",
        user: {
          _id: user._id,
          username: user.username,
          email: user.email,
          avatar: user.avatar,
          isOnline: user.isOnline,
        },
        accessToken,
      },
      { status: 200 }
    );
    response.cookies.set("accessToken", accessToken, {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: 60 * 15,
  path: "/",
});
    response.cookies.set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("[LOGIN ERROR]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
      
    );
  }
 }
//  import { NextRequest, NextResponse } from "next/server";
//  import bcrypt from "bcryptjs";
// import { connectDB, User } from "@/app/lib/db";
// import { signAccessToken, signRefreshToken } from "../jwt";

// export async function POST(req: NextRequest) {
//   try {
//     await connectDB();

//     const body = await req.json();
//     console.log("BODY:", body);

//     const { email, password } = body;

//     const user = await User.findOne({ email }).select("+password");

//     console.log("USER:", user);

//     if (!user) {
//       return NextResponse.json(
//         { message: "Invalid credentials" },
//         { status: 401 }
//       );
//     }

//     const isMatch = await bcrypt.compare(password, user.password);

//     console.log("MATCH:", isMatch);

//     if (!isMatch) {
//       return NextResponse.json(
//         { message: "Invalid credentials" },
//         { status: 401 }
//       );
//     }

//     const token = jwt.sign(
//       { userId: user._id },
//       process.env.JWT_SECRET!,
//       { expiresIn: "7d" }
//     );

//     return NextResponse.json({
//       success: true,
//       token,
//     });
//   } catch (error) {
//     console.error("LOGIN ERROR FULL:", error);

//     return NextResponse.json(
//       {
//         error: String(error),
//       },
//       { status: 500 }
//     );
//   }
// }