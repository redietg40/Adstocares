const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const promotions = await prisma.promotion.findMany({
    include: {
      company: true
    }
  });
  
  if (promotions.length === 0) {
    console.log("No promotions found in the database.");
    return;
  }
  
  promotions.forEach(promo => {
    console.log(`\n======================================`);
    console.log(`Title:       ${promo.title}`);
    console.log(`Description: ${promo.description}`);
    console.log(`Company:     ${promo.company?.companyName || 'Unknown'}`);
    console.log(`Status:      ${promo.status}`);
    console.log(`Sponsored:   ${promo.isSponsored ? 'Yes' : 'No'}`);
  });
  console.log(`\n======================================`);
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
