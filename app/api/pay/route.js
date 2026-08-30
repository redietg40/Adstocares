import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { Chapa } from "chapa-nodejs";
import { authOptions } from "../../lib/auth";

import prisma from "@/lib/prisma";
const chapa = new Chapa({
  secretKey: process.env.CHAPA_SECRET_KEY || "CHAPA-SECRET-KEY-MISSING",
});

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { promotionId, amount, paymentMethod, paymentAccount } = await request.json();

    const transactionAmount = parseFloat(amount);
    if (isNaN(transactionAmount) || transactionAmount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    // Verify promotion belongs to user if provided
    if (promotionId) {
      const promo = await prisma.promotion.findUnique({
        where: { id: promotionId },
      });
      if (!promo || promo.companyId !== user.id) {
        return NextResponse.json({ error: "Invalid promotion" }, { status: 400 });
      }
    }

    let tx_ref = await chapa.genTxRef();
    if (promotionId) {
      tx_ref = `PROMO-${promotionId}-${tx_ref}`;
    } else {
      tx_ref = `DONATION-${tx_ref}`;
    }
    
    // Create pending payment
    const payment = await prisma.payment.create({
      data: {
        companyId: user.id,
        amount: transactionAmount,
        status: "pending",
        transactionId: tx_ref,
      },
    });

    const host = request.headers.get("host");
    const protocol = host.includes("localhost") ? "http" : "https";
    const baseUrl = `${protocol}://${host}`;

    const initializeData = {
      first_name: user.companyName || "Ad2Care",
      last_name: "Company",
      email: user.email,
      currency: "ETB",
      amount: transactionAmount.toString(),
      tx_ref: tx_ref,
      callback_url: `${baseUrl}/api/webhook/chapa`,
      return_url: `${baseUrl}/company/dashboard?payment=success`,
      customization: {
        title: "Ad2Care Promotion Boost",
        description: promotionId ? "Payment to boost promotion" : "Sanitary Pad Fund Donation",
      },
    };

    const response = await chapa.initialize(initializeData);

    if (response && response.data && response.data.checkout_url) {
      return NextResponse.json({ 
        success: true, 
        checkout_url: response.data.checkout_url 
      });
    } else {
      console.error("Chapa Initialization Error:", response);
      return NextResponse.json({ error: "Failed to initialize payment with Chapa" }, { status: 500 });
    }

  } catch (error) {
    console.error("Error creating payment:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
