import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { requireEtudiant } from '../middleware/etudiant.middleware.js';
import {
  getDashboard,
  getNotifications,
  markNotificationsRead,
  getOffres,
  createCandidature,
  downloadOwnCv,
  getCandidatures,
  withdrawCandidature,
  getSeances,
  cancelSeance,
  getHeures,
  getDeclarableSessions,
  declareHeures,
  getProfil,
  updateProfil,
  updatePassword,
} from '../controllers/etudiant.controller.js';
import { uploadCv, handleUploadError, validateUploadedPdf } from '../middleware/upload.middleware.js';

const router = Router();

router.use(authenticateToken, requireEtudiant);

router.get('/dashboard', getDashboard);
router.get('/notifications', getNotifications);
router.patch('/notifications/read-all', markNotificationsRead);

router.get('/offres', getOffres);

router.get('/candidatures', getCandidatures);
router.post('/candidatures', uploadCv.single('cv'), handleUploadError, validateUploadedPdf, createCandidature);
router.get('/candidatures/:id/cv', downloadOwnCv);
router.patch('/candidatures/:id/withdraw', withdrawCandidature);

router.get('/seances', getSeances);
router.post('/seances/:id/cancel', cancelSeance);

router.get('/heures', getHeures);
router.get('/heures/declarables', getDeclarableSessions);
router.post('/heures', declareHeures);

router.get('/profil', getProfil);
router.put('/profil', updateProfil);
router.put('/profil/password', updatePassword);

export default router;
