import React, { useState, useEffect } from 'react';
import AdminCard from './AdminCard';

const CredencialesTab = ({ onSave }) => {
  const [currentUsername, setCurrentUsername] = useState('admin');
  const [usernameForm, setUsernameForm] = useState({
    currentPassword: '',
    newUsername: ''
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loadingUsername, setLoadingUsername] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    // Cargar el nombre de usuario actual
    fetch('/api/data')
      .then(res => res.json())
      .then(data => {
        if (data.config && data.config.username) {
          setCurrentUsername(data.config.username);
        }
      })
      .catch(console.error);
  }, []);

  const handleUsernameChange = (e) => {
    const { id, value } = e.target;
    setUsernameForm(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handlePasswordChange = (e) => {
    const { id, value } = e.target;
    setPasswordForm(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleChangeUsername = async () => {
    if (!usernameForm.currentPassword || !usernameForm.newUsername) {
      setMessage({ type: 'error', text: 'Todos los campos son requeridos' });
      return;
    }

    if (usernameForm.newUsername.length < 3) {
      setMessage({ type: 'error', text: 'El nombre de usuario debe tener al menos 3 caracteres' });
      return;
    }

    setLoadingUsername(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await fetch('/api/change-username', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: usernameForm.currentPassword,
          newUsername: usernameForm.newUsername
        })
      });

      const result = await response.json();
      if (result.success) {
        setMessage({ type: 'success', text: result.message });
        setCurrentUsername(usernameForm.newUsername);
        setUsernameForm({ currentPassword: '', newUsername: '' });
        if (onSave) onSave();
      } else {
        setMessage({ type: 'error', text: result.error });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error cambiando nombre de usuario' });
      console.error(error);
    } finally {
      setLoadingUsername(false);
    }
  };

  const handleChangePassword = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setMessage({ type: 'error', text: 'Todos los campos son requeridos' });
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'La nueva contraseña debe tener al menos 6 caracteres' });
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage({ type: 'error', text: 'Las contraseñas no coinciden' });
      return;
    }

    setLoadingPassword(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await fetch('/api/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
      });

      const result = await response.json();
      if (result.success) {
        setMessage({ type: 'success', text: result.message });
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        if (onSave) onSave();
      } else {
        setMessage({ type: 'error', text: result.error });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error cambiando contraseña' });
      console.error(error);
    } finally {
      setLoadingPassword(false);
    }
  };

  return (
    <AdminCard
      icon="fa-user-shield"
      title="Cambiar Credenciales de Acceso"
      subtitle="Actualiza tu nombre de usuario y/o contraseña para acceder al panel administrativo."
    >
      {/* Sección 1: Cambiar Nombre de Usuario */}
      <div className="section-credentials">
        <h3><i className="fas fa-user-edit"></i> Cambiar Nombre de Usuario</h3>
        <div className="form-group">
          <label htmlFor="currentPassword">Contraseña Actual (para verificar)</label>
          <input
            type="password"
            id="currentPassword"
            value={usernameForm.currentPassword}
            onChange={handleUsernameChange}
            placeholder="Ingresa tu contraseña actual"
          />
        </div>
        <div className="form-group">
          <label htmlFor="newUsername">Nuevo Nombre de Usuario</label>
          <input
            type="text"
            id="newUsername"
            value={usernameForm.newUsername}
            onChange={handleUsernameChange}
            placeholder="Elige un nuevo nombre de usuario"
          />
          <small className="form-hint">Mínimo 3 caracteres</small>
        </div>
        <button 
          onClick={handleChangeUsername} 
          className="btn-admin btn-username"
          disabled={loadingUsername}
        >
          {loadingUsername ? (
            <>
              <i className="fas fa-spinner fa-spin"></i> Cambiando...
            </>
          ) : (
            <>
              <i className="fas fa-user-edit"></i> Cambiar Nombre de Usuario
            </>
          )}
        </button>
      </div>
      
      <div className="separator-credentials"></div>
      
      {/* Sección 2: Cambiar Contraseña */}
      <div className="section-credentials">
        <h3><i className="fas fa-key"></i> Cambiar Contraseña</h3>
        <div className="form-group">
          <label htmlFor="currentPassword">Contraseña Actual</label>
          <input
            type="password"
            id="currentPassword"
            value={passwordForm.currentPassword}
            onChange={handlePasswordChange}
            placeholder="Ingresa tu contraseña actual"
          />
        </div>
        <div className="form-group">
          <label htmlFor="newPassword">Nueva Contraseña</label>
          <input
            type="password"
            id="newPassword"
            value={passwordForm.newPassword}
            onChange={handlePasswordChange}
            placeholder="Elige una nueva contraseña"
          />
        </div>
        <div className="form-group">
          <label htmlFor="confirmPassword">Confirmar Nueva Contraseña</label>
          <input
            type="password"
            id="confirmPassword"
            value={passwordForm.confirmPassword}
            onChange={handlePasswordChange}
            placeholder="Repite la nueva contraseña"
          />
        </div>
        <div className="password-rules">
          <p><strong>Recomendaciones de seguridad:</strong></p>
          <ul>
            <li>Mínimo 6 caracteres</li>
            <li>Combina letras y números</li>
            <li>Evita información personal obvia</li>
            <li>Anota la nueva contraseña en un lugar seguro</li>
          </ul>
        </div>
        <button 
          onClick={handleChangePassword} 
          className="btn-admin btn-password"
          disabled={loadingPassword}
        >
          {loadingPassword ? (
            <>
              <i className="fas fa-spinner fa-spin"></i> Cambiando...
            </>
          ) : (
            <>
              <i className="fas fa-sync-alt"></i> Cambiar Contraseña
            </>
          )}
        </button>
      </div>
      
      {message.text && (
        <div id="credentialMessage" style={{
          marginTop: '20px',
          padding: '15px',
          borderRadius: '10px',
          backgroundColor: message.type === 'success' ? '#d4edda' : '#f8d7da',
          color: message.type === 'success' ? '#155724' : '#721c24',
          border: `1px solid ${message.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`
        }}>
          {message.text}
        </div>
      )}
      
      {/* Sección 3: Credenciales Actuales */}
      <div className="current-credentials">
        <h3><i className="fas fa-info-circle"></i> Credenciales Actuales</h3>
        <div className="credentials-display">
          <div className="credential-item">
            <span className="credential-label">Nombre de Usuario:</span>
            <span className="credential-value" id="currentUsernameDisplay">{currentUsername}</span>
          </div>
          <div className="credential-item">
            <span className="credential-label">Contraseña:</span>
            <span className="credential-value">••••••••</span>
          </div>
          <p className="credential-note">Estas credenciales son necesarias para acceder al panel administrativo.</p>
        </div>
      </div>
    </AdminCard>
  );
};

export default CredencialesTab;