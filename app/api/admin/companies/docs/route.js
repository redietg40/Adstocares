import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get('companyId');
    if (!companyId) return NextResponse.json({ error: "Missing companyId" }, { status: 400 });

    const company = await prisma.user.findUnique({
      where: { id: companyId },
      select: {
        verifications: {
          select: {
            businessLicenseFileUrl: true,
            taxIdFileUrl: true,
          }
        }
      }
    });
    
    return NextResponse.json(company);
  } catch (error) {
    console.error("Error fetching docs:", error);
    return NextResponse.json({ error: "Failed to fetch docs" }, { status: 500 });
  }
}
