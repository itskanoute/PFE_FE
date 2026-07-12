import { Router } from 'express';
import { query } from '../config/db.js';

const router = Router();

router.get('/', async (_req, res, next) => {
  try {
    await query('SELECT 1 AS ok');
    res.json({
      status: 'ok',
      service: 'EduManage API',
      database: 'connected',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
