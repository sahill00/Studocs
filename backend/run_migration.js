const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function runMigration() {
  const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    password: process.env.DB_PASSWORD || 'postgres',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'noteflow',
  });

  try {
    const migrationFile = process.argv[2];
    if (!migrationFile) {
      console.error('Please provide a migration file name (e.g., node run_migration.js 001_hybrid_auth.sql)');
      process.exit(1);
    }
    const sql = fs.readFileSync(path.join(__dirname, 'migrations', migrationFile), 'utf8');
    await pool.query(sql);
    console.log(`Migration ${migrationFile} successful!`);
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await pool.end();
  }
}

runMigration();
