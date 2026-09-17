import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const tx_ref = searchParams.get("tx_ref");

    if (!tx_ref) {
      return NextResponse.redirect(new URL("/company/dashboard?error=Missing+transaction+reference", req.url));
    }

    const CHAPA_VERIFY_URL = `https://api.chapa.co/v1/transaction/verify/${tx_ref}`;
    const CHAPA_SECRET_KEY = process.env.CHAPA_SECRET_KEY;

    if (!CHAPA_SECRET_KEY) {
      return NextResponse.redirect(new URL("/company/dashboard?error=Missing+secret+key", req.url));
    }

    const response = await fetch(CHAPA_VERIFY_URL, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${CHAPA_SECRET_KEY}`
      }
    });

    const data = await response.json();

    if (data.status === "success") {
      // Find the payment record
      const payment = await prisma.payment.findFirst({
        where: { transactionId: { startsWith: tx_ref } }
      });

      if (!payment) {
        return NextResponse.redirect(new URL("/company/dashboard?error=Payment+record+not+found", req.url));
      }

      if (payment.status === "success") {
        // Already processed
        return NextResponse.redirect(new URL("/company/dashboard?payment=success", req.url));
      }

      // Update payment status
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: "success" }
      });

      // Extract promotion ID or "DONATION"
      const parts = payment.transactionId ? payment.transactionId.split(":::") : [];
      const promotionId = parts.length > 1 ? parts[1] : "DONATION";

      // If it's a promotion boost, update the promotion
      if (promotionId !== "DONATION") {
        await prisma.promotion.update({
          where: { id: promotionId },
          data: {
            isSponsored: true,
            karmaAmount: { increment: payment.amount }
          }
        });
      }

      // Update the global Donation fund
      await prisma.donation.upsert({
        where: { id: 1 },
        update: { totalMoney: { increment: payment.amount } },
        create: { id: 1, totalMoney: payment.amount, padsDistributed: 0 }
      });

      return NextResponse.redirect(new URL("/company/dashboard?payment=success", req.url));
    } else {
      // Payment failed on Chapa's side
      return NextResponse.redirect(new URL("/company/dashboard?error=Payment+verification+failed", req.url));
    }
  } catch (error) {
    console.error("Verification Error:", error);
    return NextResponse.redirect(new URL("/company/dashboard?error=Internal+Server+Error", req.url));
  }
}
