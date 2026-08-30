import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import prisma from "@/lib/prisma";

export async function GET() {
  return NextResponse.json({ 
    message: "Company registration API is working. Use POST to register." 
  });
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    
    const companyName = formData.get("companyName") as string;
    const licenseNumber = formData.get("licenseNumber") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const licenseFile = formData.get("licenseFile") as File;
    const taxFile = formData.get("taxFile") as File;

    if (!companyName || !licenseNumber || !email || !password || !licenseFile) {
      return NextResponse.json({ error: "All fields required" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 });
    }

    const licenseExt = licenseFile.name ? licenseFile.name.split('.').pop() : "pdf";
    const licenseFilename = `license_${Date.now()}.${licenseExt}`;

    let taxFilename = null;
    if (taxFile && taxFile.name) {
      const taxExt = taxFile.name.split('.').pop();
      taxFilename = `tax_${Date.now()}.${taxExt}`;
    }

    let licenseFileUrl = `/uploads/${licenseFilename}`;
    let taxFileUrl = taxFilename ? `/uploads/${taxFilename}` : "";

    // Read buffers once so we don't consume the stream twice
    const licenseBuffer = Buffer.from(await licenseFile.arrayBuffer());
    let taxBuffer: Buffer | null = null;
    if (taxFile) {
      taxBuffer = Buffer.from(await taxFile.arrayBuffer());
    }

    // Save file locally or fallback to Base64 data URL for Vercel serverless read-only environment
    try {
      // Check if we are obviously on Vercel to skip fs operations entirely
      if (process.env.VERCEL) {
        throw new Error("Running on Vercel, skipping local file system write");
      }

      const uploadDir = path.join(process.cwd(), "public", "uploads");
      await mkdir(uploadDir, { recursive: true });
      await writeFile(path.join(uploadDir, licenseFilename), licenseBuffer);
      if (taxFile && taxFilename && taxBuffer) {
        await writeFile(path.join(uploadDir, taxFilename), taxBuffer);
      }
    } catch (fsError) {
      console.warn("Serverless filesystem is read-only or Vercel environment detected, converting to Base64 storage.");
      licenseFileUrl = `data:${licenseFile.type || "application/pdf"};base64,${licenseBuffer.toString("base64")}`;
      if (taxFile && taxBuffer) {
        taxFileUrl = `data:${taxFile.type || "application/pdf"};base64,${taxBuffer.toString("base64")}`;
      }
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
            businessLicenseFileUrl: licenseFileUrl,
            taxIdFileUrl: taxFileUrl,
            status: "pending",
          }
        }
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: "Registration successful! Pending admin approval."
    }, { status: 201 });

  } catch (error: any) {
    console.error("Registration Error:", error);
    return NextResponse.json({ error: error?.message || "Registration failed" }, { status: 500 });
  }
}
