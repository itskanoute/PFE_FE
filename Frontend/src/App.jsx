import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

import Login from './pages/auth/Login';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import RegisterChoice from './pages/auth/RegisterChoice';
import RegisterStudent from './pages/auth/RegisterStudent';
import RegisterSchool from './pages/auth/RegisterSchool';
import Dashboard from './pages/Dashboard';

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

        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
