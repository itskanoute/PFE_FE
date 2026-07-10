import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// We will import our pages here once created
import Login from './pages/auth/Login';
import RegisterChoice from './pages/auth/RegisterChoice';
import RegisterStudent from './pages/auth/RegisterStudent';
import RegisterSchool from './pages/auth/RegisterSchool';

function App() {
  return (
    <Router>
      <Routes>
        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<RegisterChoice />} />
        <Route path="/register/student" element={<RegisterStudent />} />
        <Route path="/register/school" element={<RegisterSchool />} />
        
        {/* Default Route */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* 404 */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
