import { Router } from 'express';
import { query } from '../config/db.js';

const router = Router();

/** Liste des écoles actives (dropdown inscription étudiant) */
router.get('/', async (_req, res, next) => {
  try {
    const schools = await query(
      `SELECT id, name, acronym, email_domain
       FROM schools
       WHERE is_active = 1
       ORDER BY name ASC`
    );
    res.json(schools);
  } catch (error) {
    next(error);
  }
});

/** Filières d'une école */
router.get('/:id/filieres', async (req, res, next) => {
  try {
    const filieres = await query(
      `SELECT id, name
       FROM filieres
       WHERE school_id = ?
       ORDER BY name ASC`,
      [req.params.id]
    );
    res.json(filieres);
  } catch (error) {
    next(error);
  }
});

export default router;
