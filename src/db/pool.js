try {
  require('dotenv').config();
} catch {
  // dotenv optional if running directly without installed dependencies
}

let Pool;
try {
  Pool = require('pg').Pool;
} catch {
  // pg optional if running directly without installed dependencies
}

const connectionString = process.env.DATABASE_URL || 'postgresql://alumni:alumni@localhost:5432/alumni';

const pool = Pool ? new Pool({ connectionString }) : null;

if (pool) {
  pool.on('error', (err) => {
    console.error('Unexpected error on idle PostgreSQL client:', err);
  });
}

module.exports = {
  query: (text, params) => {
    if (!pool) return Promise.reject(new Error('PostgreSQL driver not available'));
    return pool.query(text, params);
  },
  pool,
};
