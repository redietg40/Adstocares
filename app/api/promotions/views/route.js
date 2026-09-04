import { NextResponse } from 'next/server';
import prisma from "@/lib/prisma";

export async function POST(request) {
  try {
    const { ids } = await request.json();

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ success: false, error: "No ids provided" }, { status: 400 });
    }

    // Increment views for all provided promotion IDs in one query
    await prisma.promotion.updateMany({
      where: {
        id: { in: ids }
      },
      data: {
        views: { increment: 1 }
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Bulk view tracking error:", error);
    return NextResponse.json({ error: 'Failed to track views' }, { status: 500 });
  }
}
