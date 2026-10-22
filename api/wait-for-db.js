const { pool } = require('./db');

const maxRetries = 30;
const delayMs = 2000;

async function checkConnection(attempt = 1) {
  try {
    console.log(`[Backend Init] Attempt ${attempt}/${maxRetries}: Checking database connection to "${pool.options.database}" on ${pool.options.host}:${pool.options.port}...`);
    const client = await pool.connect();
    const res = await client.query(
      `SELECT current_database() as db, count(*)::int as table_count 
       FROM information_schema.tables 
       WHERE table_schema = 'public'`
    );
    const row = res.rows[0];
    console.log(`[Backend Init] ✅ Database connection verified! Connected to database: "${row.db}" (Tables found: ${row.table_count})`);
    client.release();
    process.exit(0);
  } catch (err) {
    console.log(`[Backend Init] ⏳ Database not ready yet (${err.message}). Retrying in ${delayMs / 1000}s...`);
    if (attempt >= maxRetries) {
      console.error(`[Backend Init] ❌ Error: Failed to connect to database after ${maxRetries} attempts.`);
      process.exit(1);
    }
    setTimeout(() => checkConnection(attempt + 1), delayMs);
  }
}

checkConnection();
