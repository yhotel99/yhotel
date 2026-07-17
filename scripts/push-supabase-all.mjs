import fs from 'fs';
import path from 'path';
import pg from 'pg';
import { spawnSync } from 'child_process';

const ENV_FILE = process.argv[2] || '.env';
const DEPLOY_FUNCTION = process.argv.includes('--deploy-function');

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
if (!ref) {
  console.error(`Missing NEXT_PUBLIC_SUPABASE_URL in ${ENV_FILE}`);
  process.exit(1);
}

const passwords = [env.DATABASE_PASSWORD, env.DB_NEW_PASSWORD].filter(Boolean);
const regions = [
  'aws-0-ap-southeast-1',
  'aws-1-ap-southeast-1',
  'aws-0-ap-southeast-2',
  'aws-1-ap-southeast-2',
];

const MIGRATION_FILES = [
  '20260703120000_payment_expires_at_and_auto_cancel.sql',
  '20260703130000_fix_cancel_expired_system.sql',
  '20260703140000_fix_cancel_expired_effective_expiry.sql',
  '20260710100000_limit_cancel_expired_to_website.sql',
  '20260712100000_confirm_booking_system_skip_paid_cancel.sql', // always last — restores payment-aware RPCs
];

async function connect() {
  const attempts = [];
  for (const password of passwords) {
    for (const region of regions) {
      for (const port of [5432, 6543]) {
        attempts.push(
          `postgresql://postgres.${ref}:${encodeURIComponent(password)}@${region}.pooler.supabase.com:${port}/postgres`
        );
      }
    }
    attempts.push(
      `postgresql://postgres:${encodeURIComponent(password)}@db.${ref}.supabase.co:5432/postgres`
    );
  }

  for (const connectionString of attempts) {
    const client = new pg.Client({
      connectionString,
      ssl: { rejectUnauthorized: false },
    });
    try {
      await client.connect();
      return client;
    } catch {
      await client.end().catch(() => {});
    }
  }
  throw new Error(`Could not connect to ${ref} using ${ENV_FILE}`);
}

async function getAppliedVersions(client) {
  const { rows } = await client.query(
    `SELECT version FROM supabase_migrations.schema_migrations ORDER BY version`
  );
  return new Set(rows.map((r) => r.version));
}

async function applyMigration(client, file) {
  const version = file.replace(/\.sql$/, '').slice(0, 14);
  const sql = fs.readFileSync(path.join(process.cwd(), 'migrations', file), 'utf8');
  await client.query('BEGIN');
  try {
    await client.query(sql);
    await client.query(
      `INSERT INTO supabase_migrations.schema_migrations (version)
       VALUES ($1) ON CONFLICT DO NOTHING`,
      [version]
    );
    await client.query('COMMIT');
    console.log(`  ✓ applied ${file}`);
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  }
}

async function verify(client) {
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
  console.log(`  payment_expires_at: ${col.rows.length > 0 ? 'yes' : 'no'}`);
  console.log(`  functions: ${fns.rows.map((r) => r.proname).join(', ') || '(none)'}`);
}

function deployEdgeFunction() {
  const token = env.SUPABASE_ACCESS_TOKEN || process.env.SUPABASE_ACCESS_TOKEN;
  if (!token) {
    console.log('\n⚠ Edge Function deploy skipped: add SUPABASE_ACCESS_TOKEN to .env');
    console.log('  Create token: https://supabase.com/dashboard/account/tokens');
    return false;
  }

  console.log('\nDeploying Edge Function sepay-webhook...');
  const deploy = spawnSync(
    'supabase',
    [
      'functions',
      'deploy',
      'sepay-webhook',
      '--project-ref',
      ref,
      '--no-verify-jwt',
      '--use-api',
      '--yes',
    ],
    {
      env: { ...process.env, SUPABASE_ACCESS_TOKEN: token },
      encoding: 'utf8',
      stdio: 'pipe',
    }
  );

  if (deploy.status !== 0) {
    console.error('  ✗ deploy failed:', deploy.stderr || deploy.stdout);
    return false;
  }
  console.log('  ✓ sepay-webhook deployed');

  if (env.SEPAY_WEBHOOK_API_KEY) {
    const secrets = spawnSync(
      'supabase',
      [
        'secrets',
        'set',
        `SEPAY_WEBHOOK_API_KEY=${env.SEPAY_WEBHOOK_API_KEY}`,
        '--project-ref',
        ref,
      ],
      {
        env: { ...process.env, SUPABASE_ACCESS_TOKEN: token },
        encoding: 'utf8',
        stdio: 'pipe',
      }
    );
    if (secrets.status === 0) {
      console.log('  ✓ SEPAY_WEBHOOK_API_KEY secret set');
    } else {
      console.error('  ✗ secrets failed:', secrets.stderr || secrets.stdout);
    }
  }

  return true;
}

console.log(`\n=== Supabase push (${ENV_FILE}) → ${ref} ===\n`);

const client = await connect();
try {
  const applied = await getAppliedVersions(client);
  console.log('Applied migrations:', [...applied].filter((v) => v.startsWith('202607')).join(', ') || '(none)');

  console.log('\nApplying pending migrations...');
  for (const file of MIGRATION_FILES) {
    const version = file.replace(/\.sql$/, '').slice(0, 14);
    const isFinalFix = file.startsWith('20260712100000');
    if (applied.has(version) && !isFinalFix) {
      console.log(`  - skip ${file} (already applied)`);
      continue;
    }
    if (applied.has(version) && isFinalFix) {
      console.log(`  ↻ re-apply ${file} (ensure payment-aware RPCs)`);
    }
    try {
      await applyMigration(client, file);
      applied.add(version);
    } catch (e) {
      console.error(`  ✗ failed ${file}:`, e.message || e);
      process.exitCode = 1;
    }
  }

  console.log('\nVerify:');
  await verify(client);
} finally {
  await client.end();
}

if (DEPLOY_FUNCTION || env.SUPABASE_ACCESS_TOKEN) {
  deployEdgeFunction();
} else {
  console.log('\nTip: run with --deploy-function after adding SUPABASE_ACCESS_TOKEN to .env');
}

console.log(`\nWebhook URL: https://${ref}.supabase.co/functions/v1/sepay-webhook\n`);
