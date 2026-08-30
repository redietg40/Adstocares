import { NextResponse } from "next/server";
import crypto from "crypto";

import { Chapa } from "chapa-nodejs";

import prisma from "@/lib/prisma";
const chapa = new Chapa({
  secretKey: process.env.CHAPA_SECRET_KEY || "CHAPA-SECRET-KEY-MISSING",
});

export async function POST(request) {
  try {
    // Chapa sends the webhook via POST
    const body = await request.text();
    const signature = request.headers.get("chapa-signature");

    // Optional: Verify signature if your CHAPA_WEBHOOK_SECRET is set
    const secret = process.env.CHAPA_WEBHOOK_SECRET;
    if (secret && signature) {
      const hash = crypto.createHmac("sha256", secret).update(body).digest("hex");
      if (hash !== signature) {
        return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
      }
    }

    const data = JSON.parse(body);
    const { tx_ref, status } = data;

    if (status === "success") {
      // Find the payment record
      const payment = await prisma.payment.findFirst({
        where: { transactionId: tx_ref },
      });

      if (!payment) {
        return NextResponse.json({ error: "Payment record not found" }, { status: 404 });
      }

      // Mark payment as completed
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: "completed" },
      });

      // Check if it's a promotion payment or donation
      if (tx_ref.startsWith("PROMO-")) {
        // Extract promotionId: PROMO-{promotionId}-{original_tx_ref}
        const parts = tx_ref.split("-");
        // UUIDs have dashes too, so we need to be careful, but we just use everything between PROMO- and the last part
        // Wait, genTxRef returns a string like TX-123456...
        // Let's just parse the first part if we used another separator, but we used dashes.
        // Let's just find the promotion by ID by removing "PROMO-" and the last part.
        // Actually, easier way: PROMO_UUID_TXREF
      }
      
      // Better way since we don't have promotionId reliably from tx_ref because of UUID dashes:
      // We know tx_ref, we can verify with Chapa.
      // Wait, let's just parse it based on the assumption that UUID has 5 parts.
      // PROMO-123e4567-e89b-12d3-a456-426614174000-TX-1234
      let promotionId = null;
      if (tx_ref.startsWith("PROMO-")) {
         const match = tx_ref.match(/^PROMO-([a-f0-9\-]{36})-/i);
         if (match) {
           promotionId = match[1];
         }
      }

      if (promotionId) {
        await prisma.promotion.update({
          where: { id: promotionId },
          data: {
            status: "live",
            isSponsored: true,
            karmaAmount: {
              increment: payment.amount,
            },
          },
        });
      }

      // Update Donations global fund
      await prisma.donation.upsert({
        where: { id: 1 },
        update: {
          totalMoney: {
            increment: payment.amount,
          },
        },
        create: {
          id: 1,
          totalMoney: payment.amount,
          padsDistributed: 0,
        },
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Webhook Error:", error);
    return NextResponse.json({ error: "Failed to process webhook" }, { status: 500 });
  }
}
