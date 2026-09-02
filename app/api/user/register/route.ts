import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { hash } from "bcryptjs";
import { generateOTP, sendVerificationEmail } from "@/app/lib/email";

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 400 }
      );
    }

    const passwordHash = await hash(password, 10);

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    const origin = request.headers.get("origin") || "http://localhost:3000";
    const verificationUrl = `${origin}/verify-email?email=${encodeURIComponent(email)}&token=${otp}`;

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        companyName: name || email.split("@")[0],
        role: "USER",
        isVerified: true,
        isEmailVerified: false,
        emailVerificationToken: otp,
        emailVerificationExpires: expiresAt,
      },
    });

    await sendVerificationEmail({
      toEmail: email,
      otp,
      verificationUrl,
    });

    return NextResponse.json({
      success: true,
      requiresVerification: true,
      email: user.email,
      message: "Account created! Please check your email for your verification code.",
      user: {
        id: user.id,
        email: user.email,
        name: user.companyName,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("User registration error:", error);
    return NextResponse.json(
      { error: "Failed to create user account" },
      { status: 500 }
    );
  }
}
