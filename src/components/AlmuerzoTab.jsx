import React, { useState, useEffect } from 'react';
import AdminCard from './AdminCard';

const AlmuerzoTab = ({ data, onSave }) => {
  const [almuerzos, setAlmuerzos] = useState([]);
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [nuevoPrecio, setNuevoPrecio] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (data && data.almuerzos) {
      setAlmuerzos(data.almuerzos);
    }
  }, [data]);

  const handleAgregar = async () => {
    if (!nuevoNombre.trim()) {
      alert('⚠️ Escribe el nombre del plato o ingrediente.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/almuerzos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          nombre: nuevoNombre, 
          precio: nuevoPrecio 
        })
      });

      const result = await response.json();
      if (result.success) {
        setAlmuerzos(result.almuerzos);
        setNuevoNombre('');
        setNuevoPrecio('');
        if (onSave) onSave();
      } else {
        alert('Error al agregar: ' + result.error);
      }
    } catch (error) {
      alert('Error al agregar');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar esta opción?')) return;

    try {
      const response = await fetch(`/api/almuerzos/${id}`, {
        method: 'DELETE'
      });

      const result = await response.json();
      if (result.success) {
        setAlmuerzos(result.almuerzos);
        if (onSave) onSave();
      } else {
        alert('Error al eliminar: ' + result.error);
      }
    } catch (error) {
      alert('Error al eliminar');
      console.error(error);
    }
  };

  return (
    <AdminCard
      icon="fa-carrot"
      title="Ingredientes / Opciones"
      subtitle="Agrega o elimina opciones disponibles para 'Arma tu Almuerzo'."
    >
      <div className="input-group-row">
        <input 
          type="text" 
          value={nuevoNombre}
          onChange={(e) => setNuevoNombre(e.target.value)}
          placeholder="Nombre (ej: Arroz con Coco)" 
          style={{ flex: 2 }}
        />
        <input 
          type="number" 
          value={nuevoPrecio}
          onChange={(e) => setNuevoPrecio(e.target.value)}
          placeholder="Precio (Opcional)" 
          style={{ flex: 1 }}
        />
        <button 
          onClick={handleAgregar} 
          className="btn-admin" 
          style={{ width: 'auto', background: '#28a745' }}
          disabled={loading}
        >
          {loading ? (
            <i className="fas fa-spinner fa-spin"></i>
          ) : (
            <i className="fas fa-plus"></i>
          )}
        </button>
      </div>

      <h3>Lista Actual</h3>
      <div className="lunch-list">
        {almuerzos.length === 0 ? (
          <div className="lunch-item" style={{ justifyContent: 'center', color: '#999' }}>
            No hay opciones creadas aún.
          </div>
        ) : (
          almuerzos.map(item => (
            <div key={item.id} className="lunch-item">
              <div>
                <strong>{item.nombre}</strong>
                {item.precio && item.precio !== '0' ? (
                  <span style={{ color: '#666', fontSize: '0.9em' }}> - ${item.precio}</span>
                ) : null}
              </div>
              <i 
                className="fas fa-trash-alt btn-delete" 
                title="Eliminar" 
                onClick={() => handleEliminar(item.id)}
              ></i>
            </div>
          ))
        )}
      </div>
    </AdminCard>
  );
};

export default AlmuerzoTab;
