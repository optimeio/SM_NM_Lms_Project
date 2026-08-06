import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

// Static imports for maximum load speed, reliability, and no chunk lazy load lag
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AdminPortal from './pages/AdminPortal';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin" element={<AdminPortal />} />
        <Route path="*" element={<div style={{ padding: '50px', textAlign: 'center', color: 'var(--black-soft)' }}>Page not found</div>} />
      </Routes>
    </Router>
  );
}