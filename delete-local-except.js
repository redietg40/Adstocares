const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const emailsToKeep = [
    'redugetahun21@gmail.com',
    'redugethun21@gmail.com',
    'rgetahun897@gmail.com',
    'getahunr3@gmail.com',
    'getahunrediet3@gmail.com',
    'admin@ad2care.com'
  ];

  console.log('Fetching all users from LOCAL DB...');
  const users = await prisma.user.findMany();
  
  for (const user of users) {
    if (emailsToKeep.includes(user.email)) {
      console.log(`Skipping protected email: ${user.email}`);
      continue;
    }

    console.log(`Deleting ${user.email} (ID: ${user.id})...`);
    const userId = user.id;

    // Delete related records
    await prisma.companyVerification.deleteMany({ where: { userId } });
    await prisma.upvote.deleteMany({ where: { userId } });
    await prisma.comment.deleteMany({ where: { userId } });
    await prisma.product.deleteMany({ where: { companyId: userId } });
    
    const promos = await prisma.promotion.findMany({ where: { companyId: userId }});
    const promoIds = promos.map(p => p.id);
    if (promoIds.length > 0) {
      await prisma.upvote.deleteMany({ where: { promotionId: { in: promoIds } }});
      await prisma.comment.deleteMany({ where: { promotionId: { in: promoIds } }});
      await prisma.promotion.deleteMany({ where: { companyId: userId } });
    }
    
    await prisma.payment.deleteMany({ where: { companyId: userId } });
    
    // Delete the user
    await prisma.user.delete({ where: { id: userId } });
    console.log(`Successfully deleted ${user.email}`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
