const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: 'redugetahun21@gmail.com' }
  });

  if (!user) {
    console.log('User not found');
    return;
  }

  // Delete related records
  await prisma.companyVerification.deleteMany({ where: { userId: user.id } });
  await prisma.upvote.deleteMany({ where: { userId: user.id } });
  await prisma.comment.deleteMany({ where: { userId: user.id } });
  
  await prisma.product.deleteMany({ where: { companyId: user.id } });
  
  const promotions = await prisma.promotion.findMany({ where: { companyId: user.id }});
  const promotionIds = promotions.map(p => p.id);
  
  if (promotionIds.length > 0) {
    await prisma.upvote.deleteMany({ where: { promotionId: { in: promotionIds } }});
    await prisma.comment.deleteMany({ where: { promotionId: { in: promotionIds } }});
    await prisma.promotion.deleteMany({ where: { companyId: user.id } });
  }
  
  await prisma.payment.deleteMany({ where: { companyId: user.id } });

  // Delete the user
  await prisma.user.delete({ where: { id: user.id } });
  
  console.log('Deleted successfully');
}

main().catch(console.error).finally(() => prisma.$disconnect());
