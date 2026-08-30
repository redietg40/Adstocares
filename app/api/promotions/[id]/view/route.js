import { NextResponse } from 'next/server'; 
 
 
import prisma from "@/lib/prisma"; 
 
export async function POST(request, { params }) { 
  try { 
    const { id } = params; 
    await prisma.promotion.update({ where: { id }, data: { views: { increment: 1 } } }); 
    return NextResponse.json({ success: true }); 
  } catch (error) { 
    return NextResponse.json({ error: 'Failed to track view' }, { status: 500 }); 
  } 
} 
