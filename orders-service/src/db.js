const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS orders (
      id            SERIAL PRIMARY KEY,
      customer_name TEXT        NOT NULL,
      item          TEXT        NOT NULL,
      quantity      INTEGER     NOT NULL,
      created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
}

function query(text, params) {
  return pool.query(text, params);
}

module.exports = { initDB, query };
