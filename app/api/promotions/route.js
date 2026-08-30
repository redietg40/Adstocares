import { NextResponse } from 'next/server'; 
 
 
import prisma from "@/lib/prisma"; 
 
export async function GET() { 
  try { 
    const promotions = await prisma.promotion.findMany({ 
      where: { status: 'approved' }, 
      include: { 
        company: { select: { id: true, companyName: true, email: true } }, 
        _count: { select: { upvotes: true, comments: true } },
        upvotes: { select: { userId: true } }
      }, 
      orderBy: { createdAt: 'desc' }, 
    }); 
    return NextResponse.json(promotions); 
  } catch (error) { 
    console.error("Error fetching promotions:", error);
    return NextResponse.json({ error: 'Failed to fetch promotions' }, { status: 500 }); 
  } 
} 
