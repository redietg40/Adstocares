const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  try {
    const companies = await prisma.user.findMany({
      where: { role: 'company' },
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
            submittedAt: true
          }
        }
      },
      orderBy: { registrationDate: 'desc' }
    });
    console.log(JSON.stringify(companies, null, 2));
  } catch(e) {
    console.error('ERROR:', e);
  } finally {
    await prisma.$disconnect();
  }
}

run();
