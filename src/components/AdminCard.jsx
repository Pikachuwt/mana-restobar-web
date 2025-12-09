import React from 'react';

const AdminCard = ({ icon, title, subtitle, children }) => {
  return (
    <div className="admin-card">
      <h2><i className={`fas ${icon}`}></i> {title}</h2>
      {subtitle && <p>{subtitle}</p>}
      {children}
    </div>
  );
};

export default AdminCard;