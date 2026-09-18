const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const companies = await prisma.user.findMany({
    where: {
      role: 'company'
    },
    select: {
      email: true,
      companyName: true,
      isVerified: true
    }
  });
  
  if (companies.length === 0) {
    console.log("No companies found in the database.");
    return;
  }
  
  console.log(`\n======================================`);
  companies.forEach(company => {
    console.log(`Company Name: ${company.companyName}`);
    console.log(`Email:        ${company.email}`);
    console.log(`Verified:     ${company.isVerified}`);
    console.log(`======================================`);
  });
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
