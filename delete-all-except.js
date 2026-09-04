const { Client } = require('pg');

const neonDbUrl = "postgresql://neondb_owner:npg_8vBXLifmd3cC@ep-sweet-mouse-awpzhxfs-pooler.c-12.us-east-1.aws.neon.tech/neondb?sslmode=require";

async function main() {
  const client = new Client({ connectionString: neonDbUrl });
  await client.connect();

  const emailsToKeep = [
    'redugetahun21@gmail.com',
    'rgetahun897@gmail.com',
    'getahunr3@gmail.com',
    'getahunrediet3@gmail.com',
    'admin@ad2care.com' // Keeping admin account to avoid locking out the system
  ];

  console.log('Fetching all users...');
  const res = await client.query('SELECT id, email FROM users');
  
  for (const user of res.rows) {
    if (emailsToKeep.includes(user.email)) {
      console.log(`Skipping protected email: ${user.email}`);
      continue;
    }

    console.log(`Deleting ${user.email} (ID: ${user.id})...`);
    const userId = user.id;

    // Delete related records
    await client.query('DELETE FROM company_verification WHERE "userId" = $1', [userId]);
    await client.query('DELETE FROM upvotes WHERE "userId" = $1', [userId]);
    await client.query('DELETE FROM comments WHERE "userId" = $1', [userId]);
    await client.query('DELETE FROM products WHERE "companyId" = $1', [userId]);
    
    const promos = await client.query('SELECT id FROM promotions WHERE "companyId" = $1', [userId]);
    for (const promo of promos.rows) {
      await client.query('DELETE FROM upvotes WHERE "promotionId" = $1', [promo.id]);
      await client.query('DELETE FROM comments WHERE "promotionId" = $1', [promo.id]);
    }
    await client.query('DELETE FROM promotions WHERE "companyId" = $1', [userId]);
    await client.query('DELETE FROM payments WHERE "companyId" = $1', [userId]);
    
    await client.query('DELETE FROM users WHERE id = $1', [userId]);
    console.log(`Successfully deleted ${user.email}`);
  }

  await client.end();
}

main().catch(console.error);
