import fs from 'fs';
import pg from 'pg';

function loadEnv(file) {
  if (!fs.existsSync(file)) return {};
  return Object.fromEntries(
    fs
      .readFileSync(file, 'utf8')
      .split('\n')
      .filter((line) => line && !line.startsWith('#') && line.includes('='))
      .map((line) => {
        const idx = line.indexOf('=');
        return [line.slice(0, idx).trim(), line.slice(idx + 1).trim()];
      })
  );
}

const envFile = process.argv[2] || '.env';
const env = loadEnv(envFile);
const ref = env.NEXT_PUBLIC_SUPABASE_URL?.match(/https:\/\/([^.]+)/)?.[1];
const passwords = [env.DATABASE_PASSWORD, env.DB_NEW_PASSWORD].filter(Boolean);

async function connect() {
  for (const password of passwords) {
    const client = new pg.Client({
      connectionString: `postgresql://postgres.${ref}:${encodeURIComponent(password)}@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres`,
      ssl: { rejectUnauthorized: false },
    });
    try {
      await client.connect();
      return client;
    } catch {
      await client.end().catch(() => {});
    }
  }
  throw new Error(`Could not connect to ${ref}`);
}

const client = await connect();
try {
  const { rows } = await client.query(`
    SELECT version
    FROM supabase_migrations.schema_migrations
    WHERE version LIKE '202607%'
    ORDER BY version
  `);
  console.log(`Migrations on ${ref}:`, rows.map((r) => r.version).join(', ') || '(none)');
} finally {
  await client.end();
}
