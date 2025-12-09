import React, { useState, useEffect } from 'react';
import AdminCard from './AdminCard';

const ReservasTab = ({ data, onSave }) => {
  const [config, setConfig] = useState({
    politicaCancelacion: '',
    politicaModificacion: '',
    politicaAbono: '',
    bancoNombre: '',
    cuentaNumero: '',
    cuentaTipo: '',
    cuentaNombre: '',
    nequiNumero: ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (data && data.reservas) {
      setConfig({
        politicaCancelacion: data.reservas.politicaCancelacion || '',
        politicaModificacion: data.reservas.politicaModificacion || '',
        politicaAbono: data.reservas.politicaAbono || '',
        bancoNombre: data.reservas.bancoNombre || '',
        cuentaNumero: data.reservas.cuentaNumero || '',
        cuentaTipo: data.reservas.cuentaTipo || '',
        cuentaNombre: data.reservas.cuentaNombre || '',
        nequiNumero: data.reservas.nequiNumero || ''
      });
    }
  }, [data]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setConfig(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/reservas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });

      if (response.ok) {
        alert('✅ Configuración de reservas guardada correctamente.');
        if (onSave) onSave();
      } else {
        alert('❌ Error al guardar configuración.');
      }
    } catch (error) {
      alert('❌ Error al guardar configuración.');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminCard
      icon="fa-file-contract"
      title="Políticas y Pagos"
    >
      <h3>Políticas</h3>
      <div className="form-group">
        <label>Política de Cancelación</label>
        <textarea 
          id="politicaCancelacion"
          value={config.politicaCancelacion}
          onChange={handleChange}
          rows="2" 
        />
      </div>
      <div className="form-group">
        <label>Política de Modificación</label>
        <textarea 
          id="politicaModificacion"
          value={config.politicaModificacion}
          onChange={handleChange}
          rows="2" 
        />
      </div>
      <div className="form-group">
        <label>Política de Abono</label>
        <textarea 
          id="politicaAbono"
          value={config.politicaAbono}
          onChange={handleChange}
          rows="2" 
        />
      </div>

      <h3>Datos Bancarios</h3>
      <div className="input-group-row">
        <div style={{ flex: 1 }}>
          <label>Banco</label>
          <input 
            type="text" 
            id="bancoNombre"
            value={config.bancoNombre}
            onChange={handleChange}
          />
        </div>
        <div style={{ flex: 1 }}>
          <label>Tipo de Cuenta</label>
          <input 
            type="text" 
            id="cuentaTipo"
            value={config.cuentaTipo}
            onChange={handleChange}
          />
        </div>
      </div>
      <div className="form-group">
        <label>Número de Cuenta</label>
        <input 
          type="text" 
          id="cuentaNumero"
          value={config.cuentaNumero}
          onChange={handleChange}
        />
      </div>
      <div className="form-group">
        <label>Nombre del Titular</label>
        <input 
          type="text" 
          id="cuentaNombre"
          value={config.cuentaNombre}
          onChange={handleChange}
        />
      </div>
      <div className="form-group">
        <label>Nequi / Daviplata</label>
        <input 
          type="text" 
          id="nequiNumero"
          value={config.nequiNumero}
          onChange={handleChange}
        />
      </div>

      <button 
        onClick={handleSave} 
        className="btn-admin" 
        style={{ marginTop: '10px' }}
        disabled={saving}
      >
        {saving ? (
          <>
            <i className="fas fa-spinner fa-spin"></i> Guardando...
          </>
        ) : (
          <>
            <i className="fas fa-save"></i> Guardar Configuración de Reservas
          </>
        )}
      </button>
    </AdminCard>
  );
};

export default ReservasTab;