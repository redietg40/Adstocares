const { Client } = require('pg');

const neonDbUrl = "postgresql://neondb_owner:npg_8vBXLifmd3cC@ep-sweet-mouse-awpzhxfs-pooler.c-12.us-east-1.aws.neon.tech/neondb?sslmode=require";

async function main() {
  const client = new Client({ connectionString: neonDbUrl });
  await client.connect();

  const emails = ['redugetahun21@gmail.com', 'redugethun21@gmail.com'];

  for (const email of emails) {
    console.log(`Processing ${email}...`);
    const res = await client.query('SELECT id FROM users WHERE email = $1', [email]);
    if (res.rows.length === 0) {
      console.log(`User ${email} not found in Cloud DB.`);
      continue;
    }
    const userId = res.rows[0].id;
    console.log(`Found user ${userId}, deleting...`);
    
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
    console.log(`Successfully deleted ${email} from Cloud DB!`);
  }

  await client.end();
}

main().catch(console.error);
