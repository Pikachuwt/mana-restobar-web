import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = ({ setIsAuthenticated }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('adminToken', data.token);
        setIsAuthenticated(true);
        navigate('/');
      } else {
        alert('❌ Error: ' + (data.error || 'Credenciales incorrectas'));
      }
    } catch (error) {
      console.error(error);
      alert('⚠️ Error de conexión. Asegúrate de que el servidor esté corriendo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-body">
      <div className="admin-container">
        <div className="login-panel">
          <div className="login-box">
            <h1><i className="fas fa-lock"></i> Panel Admin</h1>
            <p className="login-subtitle">Maná Restobar</p>
            
            <form onSubmit={handleSubmit} className="login-form">
              <div className="form-group">
                <label htmlFor="username">Usuario</label>
                <input
                  type="text"
                  id="username"
                  placeholder="Ingresa tu usuario"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="password">Contraseña</label>
                <input
                  type="password"
                  id="password"
                  placeholder="Ingresa tu contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              
              <button type="submit" className="btn-admin" disabled={loading}>
                {loading ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i> Verificando...
                  </>
                ) : (
                  <>
                    <i className="fas fa-sign-in-alt"></i> Iniciar Sesión
                  </>
                )}
              </button>
            </form>
            
            <a href="/" style={{display:'block', marginTop:'20px', color:'#667eea', textDecoration:'none', fontWeight:'600'}}>
              <i className="fas fa-arrow-left"></i> Volver al sitio
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;