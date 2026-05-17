import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const companies = await prisma.user.findMany({
      where: { role: "company" },
      select: {
        id: true,
        email: true,
        companyName: true,
        companyLicenseNumber: true,
        isVerified: true,
        registrationDate: true,
        verifications: {
          select: {
            businessLicenseFileUrl: true,
            taxIdFileUrl: true,
            status: true,
            submittedAt: true,
          }
        }
      },
      orderBy: { registrationDate: "desc" },
    });
    
    return NextResponse.json(companies);
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Failed to fetch companies" }, { status: 500 });
  }
}
