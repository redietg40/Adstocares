import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";


import prisma from "@/lib/prisma";

export async function POST(request) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (user?.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const { id, action } = await request.json();

    let status = "pending";
    if (action === "approve") status = "approved";
    if (action === "reject") status = "rejected";

    const promotion = await prisma.promotion.update({
      where: { id },
      data: { status },
    });

    // If approved, increase trust score of the company
    if (action === "approve") {
      await prisma.user.update({
        where: { id: promotion.companyId },
        data: { trustScore: { increment: 1 } },
      });
    }

    return NextResponse.json({ success: true, promotion });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Failed to update promotion" }, { status: 500 });
  }
}
