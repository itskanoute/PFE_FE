import '../src/loadEnv.js';
import { query } from '../src/config/db.js';

try {
  await query(`
    ALTER TABLE applications
    ADD COLUMN cv_url VARCHAR(500) NULL
    COMMENT 'Chemin relatif du CV PDF uploadé'
    AFTER availability
  `);
  console.log('OK: colonne cv_url ajoutée');
} catch (error) {
  if (error.code === 'ER_DUP_FIELDNAME') {
    console.log('OK: colonne cv_url déjà présente');
  } else {
    console.error(error);
    process.exit(1);
  }
}

process.exit(0);
