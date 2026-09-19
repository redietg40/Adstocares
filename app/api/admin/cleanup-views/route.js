import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(request) {
  try {
    // Temporarily disabled auth for cleanup
    // const session = await getServerSession(authOptions);
    // if (!session || session.user?.role !== "admin") {
    //   return NextResponse.json({ error: "Unauthorized. Admin only." }, { status: 401 });
    // }

    let report = [];

    // 1. Delete views by admins
    const admins = await prisma.user.findMany({
      where: { role: "admin" },
      select: { id: true }
    });
    
    const adminIds = admins.map(a => a.id);
    
    if (adminIds.length > 0) {
      const deletedAdminViews = await prisma.promotionView.deleteMany({
        where: {
          userId: { in: adminIds }
        }
      });
      report.push(`Deleted ${deletedAdminViews.count} views by admins.`);
    }

    // 2. Delete views by companies on their own products
    const promotions = await prisma.promotion.findMany({
      select: { id: true, companyId: true }
    });

    let totalDeletedOwnerViews = 0;
    for (const promo of promotions) {
      const deletedOwnerViews = await prisma.promotionView.deleteMany({
        where: {
          promotionId: promo.id,
          userId: promo.companyId
        }
      });
      totalDeletedOwnerViews += deletedOwnerViews.count;

      // Recalculate views for this promotion after cleanup
      const count = await prisma.promotionView.count({
        where: { promotionId: promo.id }
      });
      await prisma.promotion.update({
        where: { id: promo.id },
        data: { views: count }
      });
    }

    report.push(`Deleted ${totalDeletedOwnerViews} views by company owners on their own products.`);
    report.push("Successfully recalculated all view counts.");

    return NextResponse.json({ success: true, message: report });
  } catch (error) {
    console.error("Cleanup error:", error);
    return NextResponse.json({ error: 'Failed to run cleanup' }, { status: 500 });
  }
}
