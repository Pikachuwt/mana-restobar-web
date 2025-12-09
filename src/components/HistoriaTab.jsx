import React, { useState, useEffect } from 'react';
import AdminCard from './AdminCard';

const HistoriaTab = ({ data, onSave }) => {
  const [historia, setHistoria] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (data && data.historia) {
      setHistoria(data.historia);
    }
  }, [data]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/historia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ texto: historia })
      });

      if (response.ok) {
        alert('✅ Historia actualizada correctamente en la página web.');
        if (onSave) onSave();
      } else {
        alert('❌ Error al guardar');
      }
    } catch (error) {
      console.error(error);
      alert('❌ Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminCard
      icon="fa-edit"
      title="Editar 'Nuestra Historia'"
      subtitle="Modifica el texto que aparece en la sección 'Sobre Nosotros' de la página principal."
    >
      <div className="form-group">
        <label>Texto de la Historia:</label>
        <textarea
          value={historia}
          onChange={(e) => setHistoria(e.target.value)}
          rows="8"
          placeholder="Escribe aquí la historia del restaurante..."
        />
      </div>
      
      <button 
        onClick={handleSave} 
        className="btn-admin" 
        style={{ width: 'auto', padding: '12px 30px' }}
        disabled={saving}
      >
        {saving ? (
          <>
            <i className="fas fa-spinner fa-spin"></i> Guardando...
          </>
        ) : (
          <>
            <i className="fas fa-save"></i> Guardar Cambios
          </>
        )}
      </button>
    </AdminCard>
  );
};

export default HistoriaTab;