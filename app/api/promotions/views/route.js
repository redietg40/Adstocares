import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(request) {
  try {
    const { ids } = await request.json();

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ success: false, error: "No ids provided" }, { status: 400 });
    }

    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    // Increment views for all provided promotion IDs in one query
    await prisma.promotion.updateMany({
      where: {
        id: { in: ids }
      },
      data: {
        views: { increment: 1 }
      }
    });

    // If user is logged in, record the view against their profile
    if (userId) {
      const viewData = ids.map(id => ({
        userId,
        promotionId: id
      }));
      
      try {
        await prisma.promotionView.createMany({
          data: viewData,
          skipDuplicates: true
        });
      } catch (err) {
        console.error("Failed to record individual views:", err);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Bulk view tracking error:", error);
    return NextResponse.json({ error: 'Failed to track views' }, { status: 500 });
  }
}
