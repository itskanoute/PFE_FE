import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import healthRoutes from './routes/health.routes.js';
import schoolsRoutes from './routes/schools.routes.js';
import authRoutes from './routes/auth.routes.js';
import adminRoutes from './routes/admin.routes.js';
import responsableRoutes from './routes/responsable.routes.js';
import etudiantRoutes from './routes/etudiant.routes.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config();

const app = express();

app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:5174',
    'http://127.0.0.1:5174',
    process.env.CORS_ORIGIN,
  ].filter(Boolean),
  credentials: true,
  exposedHeaders: ['Content-Disposition', 'Content-Type'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Fichiers uploadés (logos des écoles)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.get('/', (_req, res) => {
  res.json({
    message: 'EduManage API',
    version: '1.0.0',
    endpoints: {
      health: 'GET /api/health',
      login: 'POST /api/auth/login',
      registerSchool: 'POST /api/auth/register/school',
      registerStudent: 'POST /api/auth/register/student',
      forgotPassword: 'POST /api/auth/forgot-password',
      resetPassword: 'POST /api/auth/reset-password',
      me: 'GET /api/auth/me (Bearer token)',
      adminDashboard: 'GET /api/admin/dashboard (admin)',
      adminActivity: 'GET /api/admin/activity (admin)',
      etudiantOffres: 'GET /api/etudiant/offres (etudiant)',
      etudiantCandidatures: 'GET|POST /api/etudiant/candidatures (etudiant)',
      etudiantSeances: 'GET /api/etudiant/seances (etudiant)',
      etudiantProfil: 'GET|PUT /api/etudiant/profil (etudiant)',
      schools: 'GET /api/schools',
      filieres: 'GET /api/schools/:id/filieres',
    },
  });
});

app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/responsable', responsableRoutes);
app.use('/api/etudiant', etudiantRoutes);
app.use('/api/schools', schoolsRoutes);

app.use((_req, res) => {
  res.status(404).json({ error: 'Route introuvable' });
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({
    error: err.message || 'Erreur interne du serveur',
  });
});

export default app;
