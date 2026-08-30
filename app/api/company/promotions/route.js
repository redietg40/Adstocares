import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";


import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const promotions = await prisma.promotion.findMany({
      where: { companyId: user.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(promotions);
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Failed to fetch promotions" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!user.isVerified) {
      return NextResponse.json({ error: "Company not verified" }, { status: 403 });
    }

    const body = await request.json();
    const { title, description, link } = body;

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const isTrusted = user.trustScore >= 3;

    const promotion = await prisma.promotion.create({
      data: {
        title,
        description: description || "",
        link: link || null,
        status: isTrusted ? "approved" : "pending",
        companyId: user.id,
      },
    });

    return NextResponse.json({ success: true, promotion }, { status: 201 });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Failed to create promotion" }, { status: 500 });
  }
}
