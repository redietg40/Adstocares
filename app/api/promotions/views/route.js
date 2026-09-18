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

    // Only track views for logged-in users
    if (userId) {
      // Find which promotions don't belong to this user
      const promotions = await prisma.promotion.findMany({
        where: { id: { in: ids } },
        select: { id: true, companyId: true }
      });
      
      const validPromotionIds = promotions
        .filter(p => p.companyId !== userId)
        .map(p => p.id);

      if (validPromotionIds.length > 0) {
        const viewData = validPromotionIds.map(id => ({
          userId,
          promotionId: id
        }));
        
        try {
          // Record the unique views
          await prisma.promotionView.createMany({
            data: viewData,
            skipDuplicates: true
          });

          // Sync the integer view count on the Promotion table
          // to match the exact number of unique viewers
          for (const id of validPromotionIds) {
            const count = await prisma.promotionView.count({
              where: { promotionId: id }
            });
            await prisma.promotion.update({
              where: { id },
              data: { views: count }
            });
          }
        } catch (err) {
          console.error("Failed to record individual views:", err);
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Bulk view tracking error:", error);
    return NextResponse.json({ error: 'Failed to track views' }, { status: 500 });
  }
}
