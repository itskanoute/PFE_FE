import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { testConnection, query } from '../src/config/db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sqlPath = path.join(__dirname, '../database/password_reset_tokens.sql');
const sql = fs.readFileSync(sqlPath, 'utf8');

async function migrate() {
  await testConnection();

  const statements = sql
    .split(';')
    .map((s) => s.trim())
    .filter((s) => s && !s.startsWith('--') && !s.toUpperCase().startsWith('USE '));

  for (const statement of statements) {
    await query(statement);
  }

  console.log('Migration password_reset_tokens terminée.');
  process.exit(0);
}

migrate().catch((err) => {
  console.error('Migration échouée:', err.message);
  process.exit(1);
});
