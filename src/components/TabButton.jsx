import React from 'react';

const TabButton = ({ icon, label, active, onClick }) => {
  return (
    <button 
      className={`nav-btn ${active ? 'active' : ''}`}
      onClick={onClick}
    >
      <i className={`fas ${icon}`}></i> {label}
    </button>
  );
};

export default TabButton;