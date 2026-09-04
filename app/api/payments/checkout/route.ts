import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { amount, promotionId } = await req.json();

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    // Convert amount to string for Chapa (usually expects strings, e.g. "100")
    const amountStr = amount.toString();
    
    // Generate a unique transaction reference (Chapa max: 50 chars)
    // We'll use a short slice of the user ID (8 chars) + timestamp to ensure it stays well under 50
    const shortUserId = session.user.id.substring(0, 8);
    const tx_ref = `tx-${shortUserId}-${Date.now()}`;

    // Record the pending payment in the database
    // We store the promotionId temporarily in transactionId to link them together, 
    // or we can pass it via Chapa's customization. We will use tx_ref as the transactionId.
    const payment = await prisma.payment.create({
      data: {
        companyId: session.user.id,
        amount: parseInt(amount),
        status: "pending",
        transactionId: `${tx_ref}:::${promotionId}` // Store tx_ref AND promotionId together safely
      }
    });

    const CHAPA_URL = "https://api.chapa.co/v1/transaction/initialize";
    const CHAPA_SECRET_KEY = process.env.CHAPA_SECRET_KEY;

    if (!CHAPA_SECRET_KEY) {
      return NextResponse.json({ error: "Chapa Secret Key not configured" }, { status: 500 });
    }

    // Determine the base URL for the return url
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

    const chapaPayload = {
      amount: amountStr,
      currency: "ETB",
      email: session.user.email,
      first_name: session.user.companyName || "Company",
      last_name: "Ad2Care",
      tx_ref: tx_ref,
      callback_url: `${baseUrl}/api/payments/verify?tx_ref=${tx_ref}`,
      return_url: `${baseUrl}/api/payments/verify?tx_ref=${tx_ref}`,
      customization: {
        title: "Ad2Care Promo", // max 16 chars
        description: `Boost ${promotionId.substring(0, 8)}` // max 50 chars, NO colons allowed
      }
    };

    const response = await fetch(CHAPA_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${CHAPA_SECRET_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(chapaPayload)
    });

    const data = await response.json();

    if (data.status === "success" && data.data && data.data.checkout_url) {
      return NextResponse.json({ checkout_url: data.data.checkout_url });
    } else {
      console.error("Chapa Initialize Error:", data);
      return NextResponse.json({ error: typeof data.message === 'string' ? data.message : JSON.stringify(data) }, { status: 400 });
    }

  } catch (error) {
    console.error("Checkout Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
