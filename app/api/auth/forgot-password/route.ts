import { NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/app/lib/email";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Return a generic success message even if the user is not found
      // to prevent email enumeration attacks
      return NextResponse.json({
        message: "If an account with that email exists, we sent a password reset link.",
      });
    }

    // Generate a secure random token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Token expires in 1 hour
    const tokenExpiry = new Date(Date.now() + 60 * 60 * 1000);

    // Save token to database
    await prisma.user.update({
      where: { email },
      data: {
        passwordResetToken: resetToken,
        passwordResetExpires: tokenExpiry,
      },
    });

    // Create the reset URL based on the request origin
    // Alternatively, process.env.NEXT_PUBLIC_APP_URL could be used
    const host = req.headers.get("host");
    const protocol = host?.includes("localhost") ? "http" : "https";
    const resetUrl = `${protocol}://${host}/reset-password?token=${resetToken}`;

    // Send the email
    const emailSent = await sendPasswordResetEmail({
      toEmail: email,
      resetUrl,
    });

    if (!emailSent) {
      // In a real app, you might want to log this but still return success
      // to prevent enumeration. For now we will just return success.
      console.error("Failed to send reset email");
    }

    return NextResponse.json({
      message: "If an account with that email exists, we sent a password reset link.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
