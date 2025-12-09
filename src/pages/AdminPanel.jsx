import React, { useState, useEffect } from 'react';
import TabButton from '../components/TabButton';
import AdminCard from '../components/AdminCard';
import HistoriaTab from '../components/HistoriaTab';
import MenuTab from '../components/MenuTab';
import AlmuerzoTab from '../components/AlmuerzoTab';
import ReservasTab from '../components/ReservasTab';
import CredencialesTab from '../components/CredencialesTab';

const AdminPanel = ({ setIsAuthenticated }) => {
  const [activeTab, setActiveTab] = useState('historia');
  const [restaurantData, setRestaurantData] = useState(null);

  const tabs = [
    { id: 'credenciales', label: 'Credenciales', icon: 'fa-user-shield' },
    { id: 'historia', label: 'Nuestra Historia', icon: 'fa-book-open' },
    { id: 'menu', label: 'Menú PDF', icon: 'fa-file-pdf' },
    { id: 'almuerzo', label: 'Arma tu Almuerzo', icon: 'fa-utensils' },
    { id: 'reservas', label: 'Reservas', icon: 'fa-calendar-check' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setIsAuthenticated(false);
  };

  const loadData = async () => {
    try {
      const response = await fetch('/api/data');
      const data = await response.json();
      setRestaurantData(data);
    } catch (error) {
      console.error('Error cargando datos:', error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'historia':
        return <HistoriaTab data={restaurantData} onSave={loadData} />;
      case 'menu':
        return <MenuTab />;
      case 'almuerzo':
        return <AlmuerzoTab data={restaurantData} onSave={loadData} />;
      case 'reservas':
        return <ReservasTab data={restaurantData} onSave={loadData} />;
      case 'credenciales':
        return <CredencialesTab onSave={loadData} />;
      default:
        return <HistoriaTab data={restaurantData} onSave={loadData} />;
    }
  };

  return (
    <div className="admin-body">
      <div className="admin-container">
        <div className="admin-panel">
          <div className="admin-header">
            <h1><i className="fas fa-cogs"></i> Panel de Control</h1>
            <button className="btn-logout" onClick={handleLogout}>
              <i className="fas fa-sign-out-alt"></i> Cerrar Sesión
            </button>
          </div>
          
          <div className="admin-nav">
            {tabs.map(tab => (
              <TabButton
                key={tab.id}
                icon={tab.icon}
                label={tab.label}
                active={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id)}
              />
            ))}
          </div>
          
          <div className="admin-content">
            {restaurantData ? renderTabContent() : (
              <div style={{ textAlign: 'center', padding: '50px' }}>
                <i className="fas fa-spinner fa-spin"></i> Cargando datos...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;