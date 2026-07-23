import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { requireAdmin } from '../middleware/admin.middleware.js';
import {
  getDashboard,
  getActivity,
  getNotifications,
  markNotificationsRead,
  getResponsables,
  createResponsable,
  resendResponsableCredentials,
  updateResponsable,
  toggleResponsableStatus,
  deleteResponsable,
  getStudents,
  getStudentById,
  createStudent,
  getHours,
  getExportPreview,
  downloadExport,
  getExportHistory,
  getSchoolSettings,
  updateSchoolSettings,
  updateSchoolLogo,
  addFiliere,
  deleteFiliere,
  getProfile,
  updateProfile,
  updateProfilePassword,
} from '../controllers/admin.controller.js';
import { uploadLogo, handleUploadError } from '../middleware/upload.middleware.js';

const router = Router();

router.use(authenticateToken, requireAdmin);

router.get('/dashboard', getDashboard);
router.get('/activity', getActivity);
router.get('/notifications', getNotifications);
router.patch('/notifications/read-all', markNotificationsRead);

router.get('/responsables', getResponsables);
router.post('/responsables', createResponsable);
router.post('/responsables/:id/resend-credentials', resendResponsableCredentials);
router.put('/responsables/:id', updateResponsable);
router.patch('/responsables/:id/status', toggleResponsableStatus);
router.delete('/responsables/:id', deleteResponsable);

router.get('/students', getStudents);
router.post('/students', createStudent);
router.get('/students/:id', getStudentById);

router.get('/hours', getHours);

router.get('/export/preview', getExportPreview);
router.get('/export/download', downloadExport);
router.get('/export/history', getExportHistory);

router.get('/school', getSchoolSettings);
router.put('/school', updateSchoolSettings);
router.post('/school/logo', (req, res, next) => {
  uploadLogo.single('logo')(req, res, (err) => {
    if (err) return handleUploadError(err, req, res, next);
    next();
  });
}, updateSchoolLogo);
router.post('/school/filieres', addFiliere);
router.delete('/school/filieres/:id', deleteFiliere);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.put('/profile/password', updateProfilePassword);

export default router;
