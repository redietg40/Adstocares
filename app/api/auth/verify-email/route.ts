import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { email, token } = await request.json();

    if (!email || !token) {
      return NextResponse.json(
        { error: "Email and verification token/code are required." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User account not found." },
        { status: 404 }
      );
    }

    if (user.isEmailVerified) {
      return NextResponse.json({
        success: true,
        alreadyVerified: true,
        message: "Email is already verified. You can now log in.",
      });
    }

    if (!user.emailVerificationToken || user.emailVerificationToken !== token.trim()) {
      return NextResponse.json(
        { error: "Invalid verification code or token." },
        { status: 400 }
      );
    }

    if (user.emailVerificationExpires && user.emailVerificationExpires < new Date()) {
      return NextResponse.json(
        { error: "Verification code has expired. Please request a new code." },
        { status: 400 }
      );
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        isEmailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpires: null,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Email verified successfully! You can now log in.",
    });
  } catch (error) {
    console.error("Email Verification Error:", error);
    return NextResponse.json(
      { error: "An error occurred while verifying your email." },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");
    const token = searchParams.get("token");

    const origin = request.headers.get("origin") || searchParams.get("origin") || request.nextUrl.origin;

    if (!email || !token) {
      return NextResponse.redirect(`${origin}/verify-email?error=${encodeURIComponent("Missing verification link parameters.")}`);
    }

    const user = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    });

    if (!user) {
      return NextResponse.redirect(`${origin}/verify-email?error=${encodeURIComponent("Account not found.")}`);
    }

    if (user.isEmailVerified) {
      return NextResponse.redirect(`${origin}/verify-email?email=${encodeURIComponent(email)}&verified=true`);
    }

    if (!user.emailVerificationToken || user.emailVerificationToken !== token.trim()) {
      return NextResponse.redirect(`${origin}/verify-email?email=${encodeURIComponent(email)}&error=${encodeURIComponent("Invalid or expired link.")}`);
    }

    if (user.emailVerificationExpires && user.emailVerificationExpires < new Date()) {
      return NextResponse.redirect(`${origin}/verify-email?email=${encodeURIComponent(email)}&error=${encodeURIComponent("Verification link has expired.")}`);
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        isEmailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpires: null,
      },
    });

    return NextResponse.redirect(`${origin}/verify-email?email=${encodeURIComponent(email)}&verified=true`);
  } catch (error) {
    console.error("GET Email Verification Error:", error);
    return NextResponse.json({ error: "Failed to process verification link." }, { status: 500 });
  }
}
