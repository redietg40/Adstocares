import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  console.log("GET request received at /api/company/register");
  return NextResponse.json({ 
    message: "Company registration API is working. Use POST to register." 
  });
}

export async function POST(req: NextRequest) {
  console.log("=== POST request received ===");
  
  try {
    const formData = await req.formData();
    
    const companyName = formData.get("companyName") as string;
    const licenseNumber = formData.get("licenseNumber") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const licenseFile = formData.get("licenseFile") as File;
    const taxFile = formData.get("taxFile") as File;

    console.log("Received:", { companyName, email, licenseNumber });

    if (!companyName || !licenseNumber || !email || !password || !licenseFile) {
      return NextResponse.json({ error: "All fields required" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 });
    }

    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });

    const licenseExt = licenseFile.name.split('.').pop();
    const licenseFilename = `license_${Date.now()}.${licenseExt}`;
    await writeFile(path.join(uploadDir, licenseFilename), Buffer.from(await licenseFile.arrayBuffer()));

    let taxFilename = null;
    if (taxFile) {
      const taxExt = taxFile.name.split('.').pop();
      taxFilename = `tax_${Date.now()}.${taxExt}`;
      await writeFile(path.join(uploadDir, taxFilename), Buffer.from(await taxFile.arrayBuffer()));
    }

    const hashedPassword = await hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash: hashedPassword,
        role: "company",
        isVerified: false,
        companyName,
        companyLicenseNumber: licenseNumber,
        verifications: {
          create: {
            businessLicenseFileUrl: `/uploads/${licenseFilename}`,
            taxIdFileUrl: taxFilename ? `/uploads/${taxFilename}` : "",
            status: "pending",
          }
        }
      }
    });

    console.log("User created:", user.id);

    return NextResponse.json({ 
      success: true, 
      message: "Registration successful! Pending admin approval."
    }, { status: 201 });

  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
