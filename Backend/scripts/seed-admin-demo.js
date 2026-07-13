import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { testConnection, query } from '../src/config/db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const extraSeedPath = path.join(__dirname, '../database/seed-admin-demo.sql');

async function seedAdminDemo() {
  await testConnection();

  const [count] = await query('SELECT COUNT(*) AS total FROM activity_logs WHERE school_id = 1');

  if (Number(count.total) > 0) {
    console.log('Données admin démo déjà présentes — ignoré.');
    process.exit(0);
  }

  const sql = fs.readFileSync(extraSeedPath, 'utf8');
  const statements = sql
    .split(';')
    .map((s) => s.trim())
    .filter((s) => s && !s.startsWith('--') && !s.toUpperCase().startsWith('USE '));

  for (const statement of statements) {
    await query(statement);
  }

  console.log('Données admin démo insérées avec succès.');
  process.exit(0);
}

seedAdminDemo().catch((err) => {
  console.error('Seed admin échoué:', err.message);
  process.exit(1);
});
