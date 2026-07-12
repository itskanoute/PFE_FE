import { Router } from 'express';
import { login, getMe, registerSchool, registerStudent, forgotPassword, resetPassword } from '../controllers/auth.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { uploadLogo, handleUploadError } from '../middleware/upload.middleware.js';

const router = Router();

/**
 * Routes d'authentification
 * Préfixe dans app.js : /api/auth
 *
 * Exemple complet :
 *   POST http://localhost:3000/api/auth/login
 *   GET  http://localhost:3000/api/auth/me   (token requis)
 */

// Connexion — utilisée par la page Login du frontend
router.post('/login', login);

// Inscriptions — alignées sur les formulaires frontend
router.post('/register/school', (req, res, next) => {
  uploadLogo.single('logo')(req, res, (err) => {
    if (err) return handleUploadError(err, req, res, next);
    next();
  });
}, registerSchool);
router.post('/register/student', registerStudent);

router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Profil connecté — route protégée pour tester le token JWT
router.get('/me', authenticateToken, getMe);

export default router;
