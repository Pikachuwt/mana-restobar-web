import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import AdminPanel from './pages/AdminPanel';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar si ya hay sesión guardada
    const token = localStorage.getItem('adminToken');
    if (token) {
      // Verificar token con el servidor
      fetch('/api/auth/verify')
        .then(res => res.json())
        .then(data => {
          if (data.valid) {
            setIsAuthenticated(true);
          }
        })
        .catch(() => {
          localStorage.removeItem('adminToken');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="admin-body">
        <div style={{ textAlign: 'center', color: 'white', padding: '50px' }}>
          <i className="fas fa-spinner fa-spin fa-3x"></i>
          <p>Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={
          !isAuthenticated ? 
          <Login setIsAuthenticated={setIsAuthenticated} /> : 
          <Navigate to="/" />
        } />
        <Route path="/" element={
          isAuthenticated ? 
          <AdminPanel setIsAuthenticated={setIsAuthenticated} /> : 
          <Navigate to="/login" />
        } />
      </Routes>
    </Router>
  );
}

export default App;