import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import { ENV } from '../config/env.js';

const { Pool } = pg;

const pool = new Pool({
  connectionString: ENV.DATABASE_URL,
});

export const db = drizzle(pool);
export default db;
