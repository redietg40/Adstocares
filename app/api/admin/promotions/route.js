import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";


import prisma from "@/lib/prisma";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json([], { status: 200 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (user?.role !== "admin") {
      return NextResponse.json([], { status: 200 });
    }

    const promotions = await prisma.promotion.findMany({
      include: {
        company: {
          select: {
            companyName: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(promotions);
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json([], { status: 200 });
  }
}
