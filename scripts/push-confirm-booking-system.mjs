import fs from 'fs';
import path from 'path';
import pg from 'pg';

const FILE = '20260712100000_confirm_booking_system_skip_paid_cancel.sql';

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

const env = { ...loadEnv('.env.local'), ...loadEnv('.env') };
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
  throw new Error('Could not connect');
}

const sql = fs.readFileSync(path.join(process.cwd(), 'migrations', FILE), 'utf8');
const client = await connect();

try {
  await client.query('BEGIN');
  await client.query(sql);
  await client.query(
    `INSERT INTO supabase_migrations.schema_migrations (version)
     VALUES ($1) ON CONFLICT DO NOTHING`,
    ['20260712100000']
  );
  await client.query('COMMIT');
  console.log('Migration applied:', FILE);

  const fns = await client.query(`
    SELECT proname FROM pg_proc
    WHERE proname IN (
      'confirm_booking_system',
      'booking_has_received_payment',
      'cancel_booking_system',
      'cancel_expired_pending_bookings'
    )
    ORDER BY proname
  `);
  console.log('Functions:', fns.rows.map((r) => r.proname).join(', '));

  const hasPayFn = await client.query(`
    SELECT public.booking_has_received_payment(
      (SELECT id FROM bookings WHERE booking_code = 'YH2026071171DAE2' LIMIT 1)
    ) AS v
  `);
  console.log('Sample booking_has_received_payment:', hasPayFn.rows[0]?.v);
} catch (e) {
  await client.query('ROLLBACK');
  console.error('Migration failed:', e);
  process.exit(1);
} finally {
  await client.end();
}
