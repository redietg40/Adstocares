import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

import "dotenv/config";

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash('Admin123!', 10);
  
  await prisma.user.upsert({
    where: { email: 'admin@ad2care.com' },
    update: {},
    create: {
      email: 'admin@ad2care.com',
      passwordHash: adminPassword,
      role: 'admin',
      isVerified: true,
    },
  });

  await prisma.donation.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      totalMoney: 0,
      padsDistributed: 0,
    },
  });

  console.log('Database seeded successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
