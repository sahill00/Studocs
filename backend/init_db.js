const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function initDB() {
  // First connect to the default 'postgres' database to create 'noteflow' if it doesn't exist
  const rootPool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    password: process.env.DB_PASSWORD || 'postgres',
    port: process.env.DB_PORT || 5432,
    database: 'postgres',
  });

  try {
    const dbName = process.env.DB_NAME || 'noteflow';
    console.log(`Checking if database ${dbName} exists...`);
    const res = await rootPool.query(`SELECT datname FROM pg_catalog.pg_database WHERE datname = '${dbName}'`);
    
    if (res.rowCount === 0) {
      console.log(`Creating database ${dbName}...`);
      await rootPool.query(`CREATE DATABASE ${dbName}`);
      console.log('Database created successfully.');
    } else {
      console.log(`Database ${dbName} already exists.`);
    }
  } catch (err) {
    console.error('Error ensuring database exists. Make sure PostgreSQL is running locally and credentials in .env are correct.', err.message);
    process.exit(1);
  } finally {
    await rootPool.end();
  }

  // Now connect to the target database to run the schema
  const appPool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    password: process.env.DB_PASSWORD || 'postgres',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'noteflow',
  });

  try {
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('Applying schema to database...');
    await appPool.query(schema);
    console.log('Schema applied successfully! Tables are ready.');
  } catch (err) {
    console.error('Error applying schema:', err.message);
  } finally {
    await appPool.end();
  }
}

initDB();
