import { execSync } from 'child_process';
import pg from 'pg';

export async function initDatabase(): Promise<void> {
  const dbUrl = process.env['DATABASE_URL'];
  if (!dbUrl) {
    console.error('[db-init] DATABASE_URL is not set — skipping DB init');
    return;
  }

  const url = new URL(dbUrl);
  const dbName = url.pathname.slice(1); // strip leading /
  const adminUrl = new URL(dbUrl);
  adminUrl.pathname = '/postgres';

  // Create database if it doesn't exist
  const client = new pg.Client({ connectionString: adminUrl.toString() });
  try {
    await client.connect();
    const res = await client.query<{ datname: string }>(
      `SELECT datname FROM pg_catalog.pg_database WHERE datname = $1`,
      [dbName],
    );
    if (res.rowCount === 0) {
      await client.query(`CREATE DATABASE "${dbName}"`);
      console.log(`[db-init] Created database "${dbName}"`);
    }
  } catch (err) {
    console.warn('[db-init] Could not check/create database:', (err as Error).message);
  } finally {
    await client.end();
  }

  // Run pending migrations — walk up from this file to reach apps/api/
  // Handles both dev (src/lib/db-init.ts) and production Docker (dist/lib/db-init.js)
  const thisFile = new URL(import.meta.url).pathname;
  const apiRoot = thisFile.replace(/[\\/](?:src|dist)[\\/]lib[\\/][^/\\]+$/, '');
  // Use the local prisma binary — pnpm is not present in the production Docker runner image
  const prismaBin = `${apiRoot}/node_modules/.bin/prisma`;
  try {
    execSync(`"${prismaBin}" migrate deploy`, {
      cwd: apiRoot,
      stdio: 'inherit',
      env: process.env,
    });
    console.log('[db-init] Migrations applied');
  } catch (err) {
    console.error('[db-init] Migration failed:', (err as Error).message);
    throw err;
  }
}
