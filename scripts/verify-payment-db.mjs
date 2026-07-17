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

const env = loadEnv(process.argv[2] || '.env');
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
  const col = await client.query(`
    SELECT column_name FROM information_schema.columns
    WHERE table_schema='public' AND table_name='bookings' AND column_name='payment_expires_at'
  `);
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
  const allCancel = await client.query(`
    SELECT proname FROM pg_proc
    WHERE proname LIKE 'cancel_booking%'
    ORDER BY proname
  `);
  console.log(`${ref}: payment_expires_at=${col.rows.length > 0 ? 'yes' : 'no'}`);
  console.log('payment functions:', fns.rows.map((r) => r.proname).join(', ') || '(none)');
  console.log('cancel_booking*:', allCancel.rows.map((r) => r.proname).join(', ') || '(none)');
} finally {
  await client.end();
}
