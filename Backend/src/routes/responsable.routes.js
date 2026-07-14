import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { requireResponsable } from '../middleware/responsable.middleware.js';
import {
  getDashboard,
  getSummary,
  getOffers,
  createOffer,
  updateOffer,
  toggleOfferStatus,
  getApplications,
  reviewApplication,
  getSessions,
  createSession,
  assignSession,
  getHours,
  reviewHour,
  getProfile,
  updateProfile,
  updateProfilePassword,
} from '../controllers/responsable.controller.js';

const router = Router();

router.use(authenticateToken, requireResponsable);

router.get('/dashboard', getDashboard);
router.get('/summary', getSummary);
router.get('/offers', getOffers);
router.post('/offers', createOffer);
router.put('/offers/:id', updateOffer);
router.patch('/offers/:id/status', toggleOfferStatus);

router.get('/applications', getApplications);
router.patch('/applications/:id', reviewApplication);

router.get('/sessions', getSessions);
router.post('/sessions', createSession);
router.patch('/sessions/:id/assign', assignSession);

router.get('/hours', getHours);
router.patch('/hours/:id', reviewHour);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.put('/profile/password', updateProfilePassword);

export default router;
