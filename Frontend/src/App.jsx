import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

import Login from './pages/auth/Login';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
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

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/register" element={<RegisterChoice />} />
        <Route path="/register/student" element={<RegisterStudent />} />
        <Route path="/register/school" element={<RegisterSchool />} />

        <Route path="/dashboard/admin" element={<Dashboard />} />
        <Route path="/dashboard/student" element={<Dashboard />} />
        <Route path="/dashboard/responsable" element={<Dashboard />} />

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

        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
