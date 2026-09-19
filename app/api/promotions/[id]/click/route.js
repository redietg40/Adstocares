import { NextResponse } from 'next/server'; 
 
 
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma"; 
 
export async function POST(request, { params }) { 
  try { 
    const { id } = params; 

    // Find the promotion to check ownership
    const promotion = await prisma.promotion.findUnique({
      where: { id },
      select: { companyId: true }
    });

    if (!promotion) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    const role = session?.user?.role;

    // Do not count clicks if the user is the company owner or an admin
    if (userId !== promotion.companyId && role !== "admin") {
      await prisma.promotion.update({ where: { id }, data: { clicks: { increment: 1 } } }); 
    }
    return NextResponse.json({ success: true }); 
  } catch (error) { 
    return NextResponse.json({ error: 'Failed to track click' }, { status: 500 }); 
  } 
} 
