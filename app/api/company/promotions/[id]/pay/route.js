import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";import prisma from "@/lib/prisma";

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

    const { id } = params;
    const body = await request.json();
    const { amount, paymentMethod, paymentAccount } = body;

    // Optional: Validate payment details here
    if (!paymentAccount) {
      return NextResponse.json({ error: "Payment account details are required" }, { status: 400 });
    }

    // Verify promotion exists and belongs to the user
    const promotion = await prisma.promotion.findUnique({
      where: { id },
    });

    if (!promotion || promotion.companyId !== user.id) {
      return NextResponse.json({ error: "Promotion not found or unauthorized" }, { status: 404 });
    }

    // Process payment (Simulated)
    // Here we would integrate with TeleBirr/Chapa/etc.
    const payment = await prisma.payment.create({
      data: {
        companyId: user.id,
        amount: Number(amount) || 500,
        status: "completed",
        transactionId: `TXN-${Date.now()}`,
      },
    });

    // Update promotion to live and sponsored
    const updatedPromotion = await prisma.promotion.update({
      where: { id },
      data: {
        status: "live",
        isSponsored: true,
        karmaAmount: {
          increment: Number(amount) || 500,
        },
      },
    });

    // Update Donations global fund
    await prisma.donation.upsert({
      where: { id: 1 },
      update: {
        totalMoney: {
          increment: Number(amount) || 500,
        },
      },
      create: {
        id: 1,
        totalMoney: Number(amount) || 500,
        padsDistributed: 0,
      },
    });

    return NextResponse.json({ success: true, promotion: updatedPromotion, payment });
  } catch (error) {
    console.error("Error processing payment:", error);
    return NextResponse.json({ error: "Failed to process payment" }, { status: 500 });
  }
}
