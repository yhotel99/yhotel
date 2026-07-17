import fs from 'fs';
import path from 'path';
import pg from 'pg';

const FILE = process.argv[2];
const ENV_FILE = process.argv[3] || '.env';

if (!FILE) {
  console.error('Usage: node scripts/apply-migration-file.mjs <migration.sql> [env-file]');
  process.exit(1);
}

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

const env = loadEnv(ENV_FILE);
const ref = env.NEXT_PUBLIC_SUPABASE_URL?.match(/https:\/\/([^.]+)/)?.[1];
const passwords = [env.DATABASE_PASSWORD, env.DB_NEW_PASSWORD].filter(Boolean);
const regions = [
  'aws-0-ap-southeast-1',
  'aws-1-ap-southeast-1',
  'aws-0-ap-southeast-2',
  'aws-1-ap-southeast-2',
];

async function connect() {
  for (const password of passwords) {
    for (const region of regions) {
      for (const port of [5432, 6543]) {
        const client = new pg.Client({
          connectionString: `postgresql://postgres.${ref}:${encodeURIComponent(password)}@${region}.pooler.supabase.com:${port}/postgres`,
          ssl: { rejectUnauthorized: false },
        });
        try {
          await client.connect();
          return client;
        } catch {
          await client.end().catch(() => {});
        }
      }
    }
  }
  throw new Error(`Could not connect to ${ref}`);
}

const version = FILE.replace(/\.sql$/, '').slice(0, 14);
const sql = fs.readFileSync(path.join(process.cwd(), 'migrations', FILE), 'utf8');
const client = await connect();

try {
  await client.query('BEGIN');
  await client.query(sql);
  await client.query(
    `INSERT INTO supabase_migrations.schema_migrations (version)
     VALUES ($1) ON CONFLICT DO NOTHING`,
    [version]
  );
  await client.query('COMMIT');
  console.log(`Migration applied to ${ref}:`, FILE);
} catch (e) {
  await client.query('ROLLBACK');
  console.error('Migration failed:', e);
  process.exit(1);
} finally {
  await client.end();
}
