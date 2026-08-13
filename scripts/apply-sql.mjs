import fs from "node:fs";
import { Client } from "pg";

const sqlPath = process.argv[2];

if (!sqlPath) {
  console.error("Usage: node scripts/apply-sql.mjs <sql-file>");
  process.exit(1);
}

const sql = fs.readFileSync(sqlPath, "utf8");
const client = new Client({
  host: process.env.PGHOST,
  port: Number(process.env.PGPORT || 5432),
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE || "postgres",
  ssl: { rejectUnauthorized: false },
});

try {
  await client.connect();
  await client.query(sql);
  const { rows } = await client.query(`
    select
      (select count(*) from public.crm_leads where id::text like '1a0a1000-%') as leads,
      (select count(*) from public.social_conversations where id::text like '2a0a1000-%') as conversations,
      (select count(*) from public.social_messages where id::text like '3a0a1000-%') as messages
  `);
  console.log(JSON.stringify(rows[0]));
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
} finally {
  await client.end().catch(() => {});
}
