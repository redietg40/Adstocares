import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { PrismaClient } from "@prisma/client";
import { authOptions } from "../../../../lib/auth";

const prisma = new PrismaClient();

export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { id: promotionId } = params;

    // Check if promotion exists
    const promotion = await prisma.promotion.findUnique({
      where: { id: promotionId },
      include: { company: true },
    });

    if (!promotion) {
      return NextResponse.json({ error: "Promotion not found" }, { status: 404 });
    }

    // Check if user is upvoting their own product
    if (promotion.companyId === user.id || promotion.company?.email === user.email) {
      return NextResponse.json(
        { error: "You cannot upvote your own product!" },
        { status: 400 }
      );
    }

    // Check if user already upvoted
    const existingUpvote = await prisma.upvote.findUnique({
      where: {
        userId_promotionId: {
          userId: user.id,
          promotionId,
        },
      },
    });

    let hasUpvoted = false;

    if (existingUpvote) {
      // Toggle off upvote
      await prisma.upvote.delete({
        where: { id: existingUpvote.id },
      });
      hasUpvoted = false;
    } else {
      // Create new persistent upvote
      await prisma.upvote.create({
        data: {
          userId: user.id,
          promotionId,
        },
      });
      hasUpvoted = true;
    }

    // Get updated total count from DB
    const totalUpvotes = await prisma.upvote.count({
      where: { promotionId },
    });

    return NextResponse.json({
      success: true,
      hasUpvoted,
      totalUpvotes,
    });
  } catch (error) {
    console.error("Upvote error:", error);
    return NextResponse.json({ error: "Failed to process upvote" }, { status: 500 });
  }
}
