import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { PrismaClient } from "@prisma/client";
import { Chapa } from "chapa-nodejs";

const prisma = new PrismaClient();
const chapa = new Chapa({
  secretKey: process.env.CHAPA_SECRET_KEY || "CHAPA-SECRET-KEY-MISSING",
});

export async function POST(request) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await request.json();
    const { amount, promotionId, customDonation } = body;

    let transactionAmount = Number(amount) || 500;

    // Validate if paying for a specific promotion
    if (promotionId) {
      const promotion = await prisma.promotion.findUnique({
        where: { id: promotionId },
      });

      if (!promotion || promotion.companyId !== user.id) {
        return NextResponse.json({ error: "Promotion not found or unauthorized" }, { status: 404 });
      }
    }

    const tx_ref = `TXN-SIM-${Date.now()}`;
    
    // Simulate payment directly
    const payment = await prisma.payment.create({
      data: {
        companyId: user.id,
        amount: transactionAmount,
        status: "completed",
        transactionId: tx_ref,
      },
    });

    if (promotionId) {
      await prisma.promotion.update({
        where: { id: promotionId },
        data: {
          status: "live",
          isSponsored: true,
          karmaAmount: {
            increment: transactionAmount,
          },
        },
      });
    }

    // Update Donations global fund
    await prisma.donation.upsert({
      where: { id: 1 },
      update: {
        totalMoney: {
          increment: transactionAmount,
        },
      },
      create: {
        id: 1,
        totalMoney: transactionAmount,
        padsDistributed: 0,
      },
    });

    return NextResponse.json({ success: true, payment });

  } catch (error) {
    console.error("Error creating payment:", error);
    return NextResponse.json({ error: "Failed to create payment" }, { status: 500 });
  }
}
