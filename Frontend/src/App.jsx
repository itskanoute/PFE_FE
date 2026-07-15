import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

import Login from './pages/auth/Login';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import ChangePassword from './pages/auth/ChangePassword';
import RegisterChoice from './pages/auth/RegisterChoice';
import RegisterStudent from './pages/auth/RegisterStudent';
import RegisterSchool from './pages/auth/RegisterSchool';
import Dashboard from './pages/Dashboard';

// Admin Pages
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminActivity from './pages/admin/AdminActivity';
import AdminResponsables from './pages/admin/AdminResponsables';
import AdminEtudiants from './pages/admin/AdminEtudiants';
import AdminEtudiantDetail from './pages/admin/AdminEtudiantDetail';
import AdminHeures from './pages/admin/AdminHeures';
import AdminExport from './pages/admin/AdminExport';
import AdminParametres from './pages/admin/AdminParametres';
import AdminProfil from './pages/admin/AdminProfil';

// Responsable Pages
import ResponsableLayout from './pages/responsable/ResponsableLayout';
import ResponsableDashboard from './pages/responsable/ResponsableDashboard';
import ResponsableCandidatures from './pages/responsable/ResponsableCandidatures';
import ResponsableSeances from './pages/responsable/ResponsableSeances';
import ResponsableHeures from './pages/responsable/ResponsableHeures';
import ResponsableProfil from './pages/responsable/ResponsableProfil';
import ResponsableOffres from './pages/responsable/ResponsableOffres';

// Etudiant Pages
import EtudiantLayout from './pages/etudiant/EtudiantLayout';
import EtudiantDashboard from './pages/etudiant/EtudiantDashboard';
import EtudiantCandidatures from './pages/etudiant/EtudiantCandidatures';
import EtudiantSeances from './pages/etudiant/EtudiantSeances';
import EtudiantToutesSeances from './pages/etudiant/EtudiantToutesSeances';
import EtudiantHeures from './pages/etudiant/EtudiantHeures';
import EtudiantProfil from './pages/etudiant/EtudiantProfil';
import EtudiantOffres from './pages/etudiant/EtudiantOffres';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/change-password" element={<ChangePassword />} />
        <Route path="/register" element={<RegisterChoice />} />
        <Route path="/register/student" element={<RegisterStudent />} />
        <Route path="/register/school" element={<RegisterSchool />} />

        <Route path="/dashboard/admin" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/dashboard/responsable" element={<Navigate to="/responsable/dashboard" replace />} />
        <Route path="/dashboard/student" element={<Navigate to="/etudiant/dashboard" replace />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="activite" element={<AdminActivity />} />
          <Route path="responsables" element={<AdminResponsables />} />
          <Route path="etudiants" element={<AdminEtudiants />} />
          <Route path="etudiants/:id" element={<AdminEtudiantDetail />} />
          <Route path="heures" element={<AdminHeures />} />
          <Route path="export" element={<AdminExport />} />
          <Route path="parametres" element={<AdminParametres />} />
          <Route path="profil" element={<AdminProfil />} />
        </Route>

        {/* Responsable Routes */}
        <Route path="/responsable" element={<ResponsableLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<ResponsableDashboard />} />
          <Route path="offres" element={<ResponsableOffres />} />
          <Route path="candidatures" element={<ResponsableCandidatures />} />
          <Route path="seances" element={<ResponsableSeances />} />
          <Route path="heures" element={<ResponsableHeures />} />
          <Route path="profil" element={<ResponsableProfil />} />
        </Route>

        {/* Etudiant Routes */}
        <Route path="/etudiant" element={<EtudiantLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<EtudiantDashboard />} />
          <Route path="offres" element={<EtudiantOffres />} />
          <Route path="candidatures" element={<EtudiantCandidatures />} />
          <Route path="seances" element={<EtudiantSeances />} />
          <Route path="seances/toutes" element={<EtudiantToutesSeances />} />
          <Route path="heures" element={<EtudiantHeures />} />
          <Route path="profil" element={<EtudiantProfil />} />
        </Route>

        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
