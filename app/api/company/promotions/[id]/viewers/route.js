import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(request, { params }) {
  try {
    const { id } = params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.email || session.user.role !== "company") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify the promotion belongs to this company
    const promotion = await prisma.promotion.findUnique({
      where: { id },
      select: { companyId: true }
    });

    if (!promotion || promotion.companyId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized or promotion not found" }, { status: 403 });
    }

    const viewers = await prisma.promotionView.findMany({
      where: { promotionId: id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            companyName: true,
            role: true
          }
        }
      },
      orderBy: { viewedAt: 'desc' }
    });

    return NextResponse.json(viewers);
  } catch (error) {
    console.error("Error fetching viewers:", error);
    return NextResponse.json({ error: "Failed to fetch viewers" }, { status: 500 });
  }
}
