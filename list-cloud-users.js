const { Client } = require('pg');

const neonDbUrl = "postgresql://neondb_owner:npg_8vBXLifmd3cC@ep-sweet-mouse-awpzhxfs-pooler.c-12.us-east-1.aws.neon.tech/neondb?sslmode=require";

async function main() {
  const client = new Client({ connectionString: neonDbUrl });
  await client.connect();

  const res = await client.query('SELECT id, email, "companyName", role FROM users');
  console.log(JSON.stringify(res.rows, null, 2));

  await client.end();
}

main().catch(console.error);
