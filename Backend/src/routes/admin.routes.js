import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { requireAdmin } from '../middleware/admin.middleware.js';
import {
  getDashboard,
  getActivity,
  getResponsables,
  createResponsable,
  updateResponsable,
  toggleResponsableStatus,
  deleteResponsable,
  getStudents,
  getStudentById,
  getHours,
  getSchoolSettings,
  updateSchoolSettings,
  addFiliere,
  deleteFiliere,
  getProfile,
  updateProfile,
  updateProfilePassword,
} from '../controllers/admin.controller.js';

const router = Router();

router.use(authenticateToken, requireAdmin);

router.get('/dashboard', getDashboard);
router.get('/activity', getActivity);

router.get('/responsables', getResponsables);
router.post('/responsables', createResponsable);
router.put('/responsables/:id', updateResponsable);
router.patch('/responsables/:id/status', toggleResponsableStatus);
router.delete('/responsables/:id', deleteResponsable);

router.get('/students', getStudents);
router.get('/students/:id', getStudentById);

router.get('/hours', getHours);

router.get('/school', getSchoolSettings);
router.put('/school', updateSchoolSettings);
router.post('/school/filieres', addFiliere);
router.delete('/school/filieres/:id', deleteFiliere);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.put('/profile/password', updateProfilePassword);

export default router;
