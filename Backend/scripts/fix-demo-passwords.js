/**
 * Corrige les mots de passe des comptes de démo en base.
 * Mot de passe après exécution : Password123!
 *
 * Usage : npm run fix-passwords
 */
import bcrypt from 'bcryptjs';
import { query } from '../src/config/db.js';

const DEMO_PASSWORD = 'Password123!';

async function fixPasswords() {
  const hash = await bcrypt.hash(DEMO_PASSWORD, 10);

  const result = await query(
    'UPDATE users SET password_hash = ?',
    [hash]
  );

  console.log(`✅ ${result.affectedRows} compte(s) mis à jour`);
  console.log(`   Mot de passe pour tous : ${DEMO_PASSWORD}`);
  console.log('');
  console.log('Comptes de test :');
  console.log('  admin@escp.eu');
  console.log('  e.ettori@escp.eu');
  console.log('  lea.martin@escp.eu');
  process.exit(0);
}

fixPasswords().catch((err) => {
  console.error('❌ Erreur:', err.message);
  process.exit(1);
});
