import React, { useState } from 'react';
import AdminCard from './AdminCard';

const MenuTab = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
    } else {
      alert('Por favor selecciona un archivo PDF.');
      event.target.value = null;
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert('⚠️ Por favor selecciona un archivo PDF primero.');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('pdf', selectedFile);

    try {
      const response = await fetch('/api/menu/pdf', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      if (data.success) {
        alert('✅ PDF del menú actualizado exitosamente.');
        setSelectedFile(null);
        // Limpiar el input file
        document.getElementById('pdfInput').value = null;
      } else {
        alert('❌ Error: ' + data.error);
      }
    } catch (error) {
      alert('❌ Error al subir el archivo.');
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <AdminCard
      icon="fa-file-upload"
      title="Gestión del Menú"
    >
      <div style={{ background: 'white', padding: '20px', borderRadius: '10px', marginBottom: '20px', border: '1px solid #eee' }}>
        <h3>Menú Actual</h3>
        <p>El archivo actual se llama: <strong>menu-actual.pdf</strong></p>
        <a href="/images/menu-actual.pdf" target="_blank" style={{ color: '#667eea', fontWeight: 'bold', textDecoration: 'none' }}>
          <i className="fas fa-eye"></i> Ver PDF actual
        </a>
      </div>

      <div 
        className="upload-area" 
        onClick={() => document.getElementById('pdfInput').click()}
        style={{ cursor: 'pointer' }}
      >
        <i className="fas fa-cloud-upload-alt" style={{ fontSize: '3rem', color: '#667eea', marginBottom: '15px' }}></i>
        <h3>Subir Nuevo PDF</h3>
        <p>Haz clic para seleccionar o arrastra el archivo aquí</p>
        <p style={{ fontSize: '0.8rem', color: '#999' }}>Reemplazará automáticamente al anterior</p>
        <input 
          type="file" 
          id="pdfInput" 
          accept=".pdf" 
          style={{ display: 'none' }} 
          onChange={handleFileSelect}
        />
      </div>
      
      {selectedFile && (
        <div id="pdfFileInfo" style={{ marginTop: '15px', fontWeight: 'bold', color: '#333' }}>
          Archivo seleccionado: <span id="pdfFileName">{selectedFile.name}</span>
        </div>
      )}

      <button 
        onClick={handleUpload} 
        className="btn-admin" 
        style={{ marginTop: '20px' }}
        disabled={uploading}
      >
        {uploading ? (
          <>
            <i className="fas fa-spinner fa-spin"></i> Subiendo...
          </>
        ) : (
          <>
            <i className="fas fa-upload"></i> Actualizar Menú PDF
          </>
        )}
      </button>
    </AdminCard>
  );
};

export default MenuTab;