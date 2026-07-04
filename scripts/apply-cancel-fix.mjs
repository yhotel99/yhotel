import fs from 'fs';
import path from 'path';
import pg from 'pg';

const envPath = path.join(process.cwd(), '.env.local');
const env = Object.fromEntries(
  fs
    .readFileSync(envPath, 'utf8')
    .split('\n')
    .filter((line) => line && !line.startsWith('#'))
    .map((line) => {
      const idx = line.indexOf('=');
      return [line.slice(0, idx).trim(), line.slice(idx + 1).trim()];
    })
);

const ref = env.NEXT_PUBLIC_SUPABASE_URL?.match(/https:\/\/([^.]+)/)?.[1];
const passwords = [env.DATABASE_PASSWORD, env.DB_NEW_PASSWORD].filter(Boolean);
const regions = [
  'aws-0-ap-southeast-1',
  'aws-1-ap-southeast-1',
  'aws-0-ap-southeast-2',
  'aws-1-ap-southeast-2',
  'aws-0-ap-northeast-1',
  'aws-1-ap-northeast-1',
];

const sql = fs.readFileSync(
  path.join(process.cwd(), 'migrations/20260703130000_fix_cancel_expired_system.sql'),
  'utf8'
);

async function tryConnect() {
  for (const password of passwords) {
    for (const region of regions) {
      for (const port of [5432, 6543]) {
        const connectionString = `postgresql://postgres.${ref}:${encodeURIComponent(password)}@${region}.pooler.supabase.com:${port}/postgres`;
        const client = new pg.Client({ connectionString, ssl: { rejectUnauthorized: false } });
        try {
          await client.connect();
          console.log('Connected:', connectionString.replace(password, '***'));
          await client.query(sql);
          console.log('Migration applied successfully');
          const { rows } = await client.query(
            `SELECT public.cancel_expired_pending_bookings() AS cancelled_count`
          );
          console.log('cancel_expired_pending_bookings result:', rows[0]);
          const pending = await client.query(`
            SELECT id, booking_code, status, payment_expires_at
            FROM bookings
            WHERE status = 'pending' AND deleted_at IS NULL
            ORDER BY created_at DESC
            LIMIT 5
          `);
          console.log('Remaining pending (top 5):', pending.rows);
          await client.end();
          return;
        } catch (err) {
          await client.end().catch(() => {});
          if (!String(err.message).includes('ENOTFOUND') && !String(err.message).includes('tenant')) {
            console.error('Failed on', region, port, err.message);
          }
        }
      }
    }
  }
  throw new Error('Could not connect to database with .env.local credentials');
}

tryConnect().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
