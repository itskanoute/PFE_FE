import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const filePath = path.join(__dirname, '../src/controllers/admin.controller.js');
const content = fs.readFileSync(filePath, 'utf8');

const marker = '\n/**\n * GET /api/admin/responsables\n */\nexport async function getResponsables';
const first = content.indexOf(marker);
const second = content.indexOf(marker, first + 1);

if (second === -1) {
  console.log('Aucun doublon détecté.');
  process.exit(0);
}

const cleaned = content.slice(0, second).trimEnd() + '\n';
fs.writeFileSync(filePath, cleaned);
console.log('Doublons supprimés dans admin.controller.js');
