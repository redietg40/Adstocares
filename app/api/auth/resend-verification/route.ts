import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { generateOTP, sendVerificationEmail } from "@/app/lib/email";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    });

    if (!user) {
      return NextResponse.json({ error: "No account found with this email." }, { status: 404 });
    }

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 60 mins

    const origin = request.headers.get("origin") || request.nextUrl.origin;
    const verificationUrl = `${origin}/verify-email?email=${encodeURIComponent(email)}&token=${otp}`;

    await prisma.user.update({
      where: { id: user.id },
      data: {
        isEmailVerified: false,
        emailVerificationToken: otp,
        emailVerificationExpires: expiresAt,
      },
    });

    await sendVerificationEmail({
      toEmail: user.email,
      otp,
      verificationUrl,
    });

    return NextResponse.json({
      success: true,
      message: "A new 6-digit verification code has been sent to your email.",
    });
  } catch (error) {
    console.error("Resend Verification Error:", error);
    return NextResponse.json({ error: "Failed to resend verification email." }, { status: 500 });
  }
}
