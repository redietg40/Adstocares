import { NextRequest, NextResponse } from "next/server";


import prisma from "@/lib/prisma";

export async function POST(request) {
  try {
    const { companyId, action } = await request.json();
    
    if (action === "approve") {
      const updatedCompany = await prisma.user.update({
        where: { id: companyId },
        data: { 
          isVerified: true,
          verifications: {
            updateMany: {
              where: { status: "pending" },
              data: { status: "approved" }
            }
          }
        },
      });
      
      return NextResponse.json({ 
        success: true, 
        message: "Company verified successfully" 
      });
    }
    
    if (action === "reject") {
      const updatedCompany = await prisma.user.update({
        where: { id: companyId },
        data: { 
          isVerified: false,
          verifications: {
            updateMany: {
              where: { status: "pending" },
              data: { status: "rejected" }
            }
          }
        },
      });
      
      return NextResponse.json({ 
        success: true, 
        message: "Company rejected" 
      });
    }
    
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Failed to verify company" }, { status: 500 });
  }
}
