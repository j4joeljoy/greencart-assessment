import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  FiUsers, 
  FiMapPin, 
  FiPackage, 
  FiPlus, 
  FiEdit2, 
  FiTrash2, 
  FiCheckCircle, 
  FiAlertTriangle, 
  FiClock, 
  FiTrendingUp,
  FiX,
  FiSave
} from '../components/Icons';

const ManagementPage = () => {
  const [drivers, setDrivers] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [activeTab, setActiveTab] = useState('drivers');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      if (!isAuthenticated) return;

      const accessToken = localStorage.getItem('accessToken');
      try {
        // Fetch all data in parallel
        const [driversRes, routesRes, ordersRes] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'}/api/drivers/`, {
            headers: { 'Authorization': `Bearer ${accessToken}` },
          }),
          fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'}/api/routes/`, {
            headers: { 'Authorization': `Bearer ${accessToken}` },
          }),
          fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'}/api/orders/`, {
            headers: { 'Authorization': `Bearer ${accessToken}` },
          })
        ]);

        if (!driversRes.ok || !routesRes.ok || !ordersRes.ok) {
          throw new Error('Failed to fetch data.');
        }

        const [driversData, routesData, ordersData] = await Promise.all([
          driversRes.json(),
          routesRes.json(),
          ordersRes.json()
        ]);

        setDrivers(driversData);
        setRoutes(routesData);
        setOrders(ordersData);
      } catch (err) {
        setError(err.message);
      }
    };
    fetchData();
  }, [isAuthenticated]);

  // CRUD Functions
  const handleDelete = async (type, id) => {
    if (!window.confirm(`Are you sure you want to delete this ${type}?`)) return;

    const accessToken = localStorage.getItem('accessToken');
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'}/api/${type}/${id}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${accessToken}` },
      });

      if (!response.ok) {
        throw new Error(`Failed to delete ${type}.`);
      }

      // Update local state
      if (type === 'drivers') {
        setDrivers(drivers.filter(d => d.id !== id));
      } else if (type === 'routes') {
        setRoutes(routes.filter(r => r.id !== id));
      } else if (type === 'orders') {
        setOrders(orders.filter(o => o.id !== id));
      }

      setSuccessMessage(`${type.charAt(0).toUpperCase() + type.slice(1)} deleted successfully!`);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (item, type) => {
    setEditingItem({ ...item, type });
    setShowAddForm(true);
  };

  const handleAdd = (type) => {
    setEditingItem({ type });
    setShowAddForm(true);
  };

  const handleFormSubmit = async (formData) => {
    const accessToken = localStorage.getItem('accessToken');
    const { type, ...data } = formData;
    
    try {
      let url = `${import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'}/api/${type}/`;
      let method = 'POST';
      
      if (editingItem && editingItem.id) {
        url = `${import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'}/api/${type}/${editingItem.id}/`;
        method = 'PUT';
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to ${editingItem && editingItem.id ? 'update' : 'create'} ${type}.`);
      }

      const result = await response.json();
      
      // Update local state
      if (type === 'drivers') {
        if (editingItem && editingItem.id) {
          setDrivers(drivers.map(d => d.id === editingItem.id ? result : d));
        } else {
          setDrivers([...drivers, result]);
        }
      } else if (type === 'routes') {
        if (editingItem && editingItem.id) {
          setRoutes(routes.map(r => r.id === editingItem.id ? result : r));
        } else {
          setRoutes([...routes, result]);
        }
      } else if (type === 'orders') {
        if (editingItem && editingItem.id) {
          setOrders(orders.map(o => o.id === editingItem.id ? result : o));
        } else {
          setOrders([...orders, result]);
        }
      }

      setSuccessMessage(`${type.charAt(0).toUpperCase() + type.slice(1)} ${editingItem && editingItem.id ? 'updated' : 'created'} successfully!`);
      setShowAddForm(false);
      setEditingItem(null);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleFormCancel = () => {
    setShowAddForm(false);
    setEditingItem(null);
  };

  return (
    <div className="container" style={{ padding: '2rem 1rem' }}>
      <div className="fade-in">
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)'
            }}>
              <FiUsers size={24} color="white" />
            </div>
            <div>
          <h1 style={{ 
            fontSize: '2.5rem', 
                fontWeight: '700', 
            color: 'white',
            margin: 0,
                textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                letterSpacing: '-0.02em'
          }}>
                Management Dashboard
          </h1>
          <p style={{ 
            color: 'rgba(255, 255, 255, 0.8)', 
            margin: '0.5rem 0 0 0',
                fontSize: '1.1rem',
                fontWeight: '400'
          }}>
                Driver Management & Performance Analytics
          </p>
            </div>
          </div>
        </div>

        <div className="card" style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <div className="card-header">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 16px rgba(79, 70, 229, 0.3)'
                }}>
                  <FiTrendingUp size={20} color="white" />
                </div>
              <h2 style={{ 
                margin: 0, 
                fontSize: '1.5rem', 
                fontWeight: '600',
                color: 'var(--text-primary)',
                  letterSpacing: '-0.01em'
              }}>
                  Data Management
              </h2>
              </div>
              <button
                className="btn btn-primary"
                onClick={() => handleAdd(activeTab)}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem',
                  background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.75rem 1.5rem',
                  color: 'white',
                  fontWeight: '500',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 4px 16px rgba(79, 70, 229, 0.3)'
                }}
                onMouseOver={(e) => {
                  e.target.style.transform = 'translateY(-1px)';
                  e.target.style.boxShadow = '0 6px 20px rgba(79, 70, 229, 0.4)';
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 16px rgba(79, 70, 229, 0.3)';
                }}
              >
                <FiPlus size={16} />
                Add New
              </button>
            </div>
            
            {/* Tabs */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', background: 'rgba(0, 0, 0, 0.02)', borderRadius: '12px', padding: '4px' }}>
              {[
                { id: 'drivers', label: 'Drivers', icon: FiUsers, count: drivers.length, color: '#3b82f6' },
                { id: 'routes', label: 'Routes', icon: FiMapPin, count: routes.length, color: '#10b981' },
                { id: 'orders', label: 'Orders', icon: FiPackage, count: orders.length, color: '#f59e0b' }
              ].map(tab => {
                const IconComponent = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                      padding: '0.75rem 1.25rem',
                    border: 'none',
                      borderRadius: '8px',
                      background: isActive ? 'white' : 'transparent',
                      color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontWeight: '500',
                      fontSize: '0.875rem',
                      transition: 'all 0.2s ease-in-out',
                      boxShadow: isActive ? '0 2px 8px rgba(0, 0, 0, 0.1)' : 'none',
                      position: 'relative'
                    }}
                    onMouseOver={(e) => {
                      if (!isActive) {
                        e.target.style.background = 'rgba(255, 255, 255, 0.5)';
                      }
                    }}
                    onMouseOut={(e) => {
                      if (!isActive) {
                        e.target.style.background = 'transparent';
                      }
                    }}
                  >
                    <IconComponent size={16} color={isActive ? tab.color : 'currentColor'} />
                    <span>{tab.label}</span>
                    <span style={{
                      background: isActive ? tab.color : 'rgba(0, 0, 0, 0.1)',
                      color: isActive ? 'white' : 'var(--text-secondary)',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '12px',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      minWidth: '20px',
                      textAlign: 'center'
                    }}>
                      {tab.count}
                    </span>
                </button>
                );
              })}
            </div>
          </div>

          {error && (
            <div style={{
              background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.05) 100%)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              borderRadius: '12px',
              padding: '1rem',
              marginBottom: '1.5rem',
              color: '#dc2626',
              fontSize: '0.875rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              boxShadow: '0 2px 8px rgba(239, 68, 68, 0.1)'
            }}>
              <div style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                background: 'rgba(239, 68, 68, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <FiAlertTriangle size={12} />
              </div>
              {error}
            </div>
          )}

          {successMessage && (
            <div style={{
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.05) 100%)',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              borderRadius: '12px',
              padding: '1rem',
              marginBottom: '1.5rem',
              color: '#059669',
              fontSize: '0.875rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              boxShadow: '0 2px 8px rgba(16, 185, 129, 0.1)'
            }}>
              <div style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                background: 'rgba(16, 185, 129, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <FiCheckCircle size={12} />
              </div>
              {successMessage}
            </div>
          )}

          {/* Tab Content */}
          {activeTab === 'drivers' && (
            <DriversTable 
              drivers={drivers} 
              onEdit={(driver) => handleEdit(driver, 'drivers')}
              onDelete={(id) => handleDelete('drivers', id)}
            />
          )}
          
          {activeTab === 'routes' && (
            <RoutesTable 
              routes={routes} 
              onEdit={(route) => handleEdit(route, 'routes')}
              onDelete={(id) => handleDelete('routes', id)}
            />
          )}
          
          {activeTab === 'orders' && (
            <OrdersTable 
              orders={orders} 
              onEdit={(order) => handleEdit(order, 'orders')}
              onDelete={(id) => handleDelete('orders', id)}
            />
          )}

          {/* Add/Edit Form Modal */}
          {showAddForm && (
            <AddEditForm
              type={editingItem?.type || activeTab}
              item={editingItem}
              routes={routes}
              onSubmit={handleFormSubmit}
              onCancel={handleFormCancel}
            />
          )}

          <div style={{
            marginTop: '2rem',
            padding: '1rem',
            background: 'rgba(37, 99, 235, 0.05)',
            borderRadius: 'var(--radius)',
            fontSize: '0.875rem',
            color: 'var(--text-secondary)'
          }}>
            <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-primary)' }}>
              📊 Performance Legend
            </h4>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{
                  background: 'rgba(16, 185, 129, 0.1)',
                  color: 'var(--success-color)',
                  padding: '0.25rem 0.5rem',
                  borderRadius: 'var(--radius)',
                  fontSize: '0.75rem'
                }}>
                  ✅ Optimal
                </span>
                <span>30-50 hours/week</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{
                  background: 'rgba(245, 158, 11, 0.1)',
                  color: 'var(--warning-color)',
                  padding: '0.25rem 0.5rem',
                  borderRadius: 'var(--radius)',
                  fontSize: '0.75rem'
                }}>
                  ⚡ Available
                </span>
                <span>&lt;30 hours/week</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  color: 'var(--error-color)',
                  padding: '0.25rem 0.5rem',
                  borderRadius: 'var(--radius)',
                  fontSize: '0.75rem'
                }}>
                  ⚠️ Overworked
                </span>
                <span>&gt;50 hours/week</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Component definitions
const DriversTable = ({ drivers, onEdit, onDelete }) => {
  if (drivers.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-secondary)' }}>
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '20px',
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 197, 253, 0.05) 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.5rem',
          boxShadow: '0 8px 32px rgba(59, 130, 246, 0.1)'
        }}>
          <FiUsers size={32} color="#3b82f6" />
        </div>
        <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-primary)', fontSize: '1.25rem', fontWeight: '600' }}>No Drivers Found</h3>
        <p style={{ margin: 0, fontSize: '0.875rem' }}>No driver data is available.</p>
      </div>
    );
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
        <thead>
          <tr style={{ background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(147, 197, 253, 0.02) 100%)', borderBottom: '2px solid rgba(59, 130, 246, 0.1)' }}>
            <th style={{ padding: '1.25rem 1rem', textAlign: 'left', fontWeight: '600', color: 'var(--text-primary)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FiUsers size={14} color="#3b82f6" />
                Driver Name
              </div>
            </th>
            <th style={{ padding: '1.25rem 1rem', textAlign: 'left', fontWeight: '600', color: 'var(--text-primary)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FiClock size={14} color="#3b82f6" />
                Current Shift
              </div>
            </th>
            <th style={{ padding: '1.25rem 1rem', textAlign: 'left', fontWeight: '600', color: 'var(--text-primary)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FiTrendingUp size={14} color="#3b82f6" />
                Past 7 Days
              </div>
            </th>
            <th style={{ padding: '1.25rem 1rem', textAlign: 'left', fontWeight: '600', color: 'var(--text-primary)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FiCheckCircle size={14} color="#3b82f6" />
                Status
              </div>
            </th>
            <th style={{ padding: '1.25rem 1rem', textAlign: 'left', fontWeight: '600', color: 'var(--text-primary)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {drivers.map((driver) => {
            const currentHours = parseFloat(driver.current_shift_hours);
            const pastWeekHours = parseFloat(driver.past_7_day_work_hours);
            const isOverworked = pastWeekHours > 50;
            const isUnderutilized = pastWeekHours < 30;
            
            return (
              <tr key={driver.id} style={{ 
                borderBottom: '1px solid rgba(0, 0, 0, 0.05)', 
                transition: 'all 0.2s ease-in-out',
                background: 'white'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = 'rgba(59, 130, 246, 0.02)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'white';
              }}
              >
                <td style={{ padding: '1.25rem 1rem', fontWeight: '500', color: 'var(--text-primary)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ 
                      width: '40px', 
                      height: '40px', 
                      borderRadius: '12px', 
                      background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      color: 'white', 
                      fontSize: '0.875rem', 
                      fontWeight: '600',
                      boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                    }}>
                      {driver.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: '600', fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                    {driver.name}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        Driver ID: {driver.id}
                      </div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '1.25rem 1rem', color: 'var(--text-secondary)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{
                      background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 197, 253, 0.05) 100%)',
                      color: '#3b82f6',
                      padding: '0.5rem 0.75rem',
                      borderRadius: '8px',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      border: '1px solid rgba(59, 130, 246, 0.2)'
                    }}>
                    {currentHours}h
                    </div>
                  </div>
                </td>
                <td style={{ padding: '1.25rem 1rem', color: 'var(--text-secondary)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{
                      background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(52, 211, 153, 0.05) 100%)',
                      color: '#10b981',
                      padding: '0.5rem 0.75rem',
                      borderRadius: '8px',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      border: '1px solid rgba(16, 185, 129, 0.2)'
                    }}>
                    {pastWeekHours}h
                    </div>
                  </div>
                </td>
                <td style={{ padding: '1.25rem 1rem' }}>
                  <div style={{
                    background: isOverworked 
                      ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.05) 100%)'
                      : isUnderutilized 
                      ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(217, 119, 6, 0.05) 100%)'
                      : 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.05) 100%)',
                    color: isOverworked ? '#dc2626' : isUnderutilized ? '#d97706' : '#059669',
                    padding: '0.5rem 0.75rem',
                    borderRadius: '8px',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    width: 'fit-content',
                    border: `1px solid ${isOverworked ? 'rgba(239, 68, 68, 0.2)' : isUnderutilized ? 'rgba(245, 158, 11, 0.2)' : 'rgba(16, 185, 129, 0.2)'}`
                  }}>
                    {isOverworked ? (
                      <>
                        <FiAlertTriangle size={12} />
                        Overworked
                      </>
                    ) : isUnderutilized ? (
                      <>
                        <FiClock size={12} />
                        Available
                      </>
                    ) : (
                      <>
                        <FiCheckCircle size={12} />
                        Optimal
                      </>
                    )}
                  </div>
                </td>
                <td style={{ padding: '1.25rem 1rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button 
                      onClick={() => onEdit(driver)} 
                      style={{ 
                        padding: '0.5rem', 
                        fontSize: '0.75rem',
                        background: 'linear-gradient(135deg, rgba(107, 114, 128, 0.1) 0%, rgba(75, 85, 99, 0.05) 100%)',
                        color: '#6b7280',
                        border: '1px solid rgba(107, 114, 128, 0.2)',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseOver={(e) => {
                        e.target.style.background = 'linear-gradient(135deg, rgba(107, 114, 128, 0.2) 0%, rgba(75, 85, 99, 0.1) 100%)';
                        e.target.style.transform = 'translateY(-1px)';
                      }}
                      onMouseOut={(e) => {
                        e.target.style.background = 'linear-gradient(135deg, rgba(107, 114, 128, 0.1) 0%, rgba(75, 85, 99, 0.05) 100%)';
                        e.target.style.transform = 'translateY(0)';
                      }}
                    >
                      <FiEdit2 size={14} />
                    </button>
                    <button 
                      onClick={() => onDelete(driver.id)} 
                      style={{ 
                        padding: '0.5rem', 
                        fontSize: '0.75rem',
                        background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.05) 100%)',
                        color: '#dc2626',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseOver={(e) => {
                        e.target.style.background = 'linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(220, 38, 38, 0.1) 100%)';
                        e.target.style.transform = 'translateY(-1px)';
                      }}
                      onMouseOut={(e) => {
                        e.target.style.background = 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.05) 100%)';
                        e.target.style.transform = 'translateY(0)';
                      }}
                    >
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

const RoutesTable = ({ routes, onEdit, onDelete }) => {
  if (routes.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-secondary)' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🛣️</div>
        <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-primary)' }}>No Routes Found</h3>
        <p>No route data is available.</p>
      </div>
    );
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
        <thead>
          <tr style={{ background: 'rgba(37, 99, 235, 0.05)', borderBottom: '2px solid var(--border-color)' }}>
            <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: 'var(--text-primary)', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>🛣️ Route ID</th>
            <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: 'var(--text-primary)', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>📏 Distance (km)</th>
            <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: 'var(--text-primary)', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>🚦 Traffic Level</th>
            <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: 'var(--text-primary)', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>⏱️ Base Time (min)</th>
            <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: 'var(--text-primary)', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {routes.map((route) => (
            <tr key={route.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background-color 0.2s ease-in-out' }}>
              <td style={{ padding: '1rem', fontWeight: '500', color: 'var(--text-primary)' }}>{route.route_id}</td>
              <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{route.distance_km} km</td>
              <td style={{ padding: '1rem' }}>
                <span style={{
                  background: route.traffic_level.toLowerCase() === 'high' ? 'rgba(239, 68, 68, 0.1)' : route.traffic_level.toLowerCase() === 'medium' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                  color: route.traffic_level.toLowerCase() === 'high' ? 'var(--error-color)' : route.traffic_level.toLowerCase() === 'medium' ? 'var(--warning-color)' : 'var(--success-color)',
                  padding: '0.25rem 0.5rem', borderRadius: 'var(--radius)', fontSize: '0.75rem', fontWeight: '500'
                }}>
                  {route.traffic_level}
                </span>
              </td>
              <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{route.base_time} min</td>
              <td style={{ padding: '1rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => onEdit(route)} className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>✏️</button>
                  <button onClick={() => onDelete(route.id)} className="btn btn-danger" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>🗑️</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const OrdersTable = ({ orders, onEdit, onDelete }) => {
  if (orders.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-secondary)' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📦</div>
        <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-primary)' }}>No Orders Found</h3>
        <p>No order data is available.</p>
      </div>
    );
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
        <thead>
          <tr style={{ background: 'rgba(37, 99, 235, 0.05)', borderBottom: '2px solid var(--border-color)' }}>
            <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: 'var(--text-primary)', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>📦 Order ID</th>
            <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: 'var(--text-primary)', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>💰 Value (₹)</th>
            <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: 'var(--text-primary)', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>🛣️ Route</th>
            <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: 'var(--text-primary)', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>⏰ Status</th>
            <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: 'var(--text-primary)', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background-color 0.2s ease-in-out' }}>
              <td style={{ padding: '1rem', fontWeight: '500', color: 'var(--text-primary)' }}>{order.order_id}</td>
              <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>₹{order.value_rs}</td>
              <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{order.assigned_route?.route_id || 'N/A'}</td>
              <td style={{ padding: '1rem' }}>
                <span style={{
                  background: order.is_late ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                  color: order.is_late ? 'var(--error-color)' : 'var(--success-color)',
                  padding: '0.25rem 0.5rem', borderRadius: 'var(--radius)', fontSize: '0.75rem', fontWeight: '500'
                }}>
                  {order.is_late ? '⏰ Late' : '✅ On Time'}
                </span>
              </td>
              <td style={{ padding: '1rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => onEdit(order)} className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>✏️</button>
                  <button onClick={() => onDelete(order.id)} className="btn btn-danger" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>🗑️</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Add/Edit Form Component
const AddEditForm = ({ type, item, routes, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (item && item.id) {
      // Editing existing item
      setFormData(item);
    } else {
      // Adding new item - set defaults
      if (type === 'drivers') {
        setFormData({ name: '', current_shift_hours: 0, past_7_day_work_hours: 0 });
      } else if (type === 'routes') {
        setFormData({ route_id: '', distance_km: 0, traffic_level: 'low', base_time: 0 });
      } else if (type === 'orders') {
        setFormData({ order_id: '', value_rs: 0, assigned_route: null, is_late: false });
      }
    }
  }, [item, type]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ ...formData, type });
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getFormFields = () => {
    if (type === 'drivers') {
      return (
        <>
          <div className="form-group">
            <label className="form-label">Driver Name</label>
            <input
              type="text"
              className="form-input"
              value={formData.name || ''}
              onChange={(e) => handleChange('name', e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Current Shift Hours</label>
            <input
              type="number"
              className="form-input"
              value={formData.current_shift_hours || ''}
              onChange={(e) => handleChange('current_shift_hours', parseFloat(e.target.value) || 0)}
              step="0.01"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Past 7 Day Work Hours</label>
            <input
              type="number"
              className="form-input"
              value={formData.past_7_day_work_hours || ''}
              onChange={(e) => handleChange('past_7_day_work_hours', parseFloat(e.target.value) || 0)}
              step="0.01"
              required
            />
          </div>
        </>
      );
    } else if (type === 'routes') {
      return (
        <>
          <div className="form-group">
            <label className="form-label">Route ID</label>
            <input
              type="text"
              className="form-input"
              value={formData.route_id || ''}
              onChange={(e) => handleChange('route_id', e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Distance (km)</label>
            <input
              type="number"
              className="form-input"
              value={formData.distance_km || ''}
              onChange={(e) => handleChange('distance_km', parseFloat(e.target.value) || 0)}
              step="0.01"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Traffic Level</label>
            <select
              className="form-input"
              value={formData.traffic_level || 'low'}
              onChange={(e) => handleChange('traffic_level', e.target.value)}
              required
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Base Time (minutes)</label>
            <input
              type="number"
              className="form-input"
              value={formData.base_time || ''}
              onChange={(e) => handleChange('base_time', parseInt(e.target.value) || 0)}
              required
            />
          </div>
        </>
      );
    } else if (type === 'orders') {
      return (
        <>
          <div className="form-group">
            <label className="form-label">Order ID</label>
            <input
              type="text"
              className="form-input"
              value={formData.order_id || ''}
              onChange={(e) => handleChange('order_id', e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Value (₹)</label>
            <input
              type="number"
              className="form-input"
              value={formData.value_rs || ''}
              onChange={(e) => handleChange('value_rs', parseFloat(e.target.value) || 0)}
              step="0.01"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Assigned Route</label>
            <select
              className="form-input"
              value={formData.assigned_route || ''}
              onChange={(e) => handleChange('assigned_route', e.target.value ? parseInt(e.target.value) : null)}
            >
              <option value="">Select a route</option>
              {routes.map(route => (
                <option key={route.id} value={route.id}>
                  {route.route_id} - {route.distance_km}km ({route.traffic_level})
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">
              <input
                type="checkbox"
                checked={formData.is_late || false}
                onChange={(e) => handleChange('is_late', e.target.checked)}
                style={{ marginRight: '0.5rem' }}
              />
              Is Late
            </label>
          </div>
        </>
      );
    }
    return null;
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.6)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '2rem',
        maxWidth: '500px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)',
        border: '1px solid rgba(255, 255, 255, 0.2)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 16px rgba(79, 70, 229, 0.3)'
            }}>
              <FiSave size={20} color="white" />
            </div>
            <h3 style={{ 
              margin: 0, 
              color: 'var(--text-primary)', 
              fontSize: '1.25rem',
              fontWeight: '600'
            }}>
              {item && item.id ? `Edit ${type.charAt(0).toUpperCase() + type.slice(1)}` : `Add New ${type.charAt(0).toUpperCase() + type.slice(1)}`}
            </h3>
          </div>
          <button
            onClick={onCancel}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'rgba(107, 114, 128, 0.1)',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#6b7280',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.target.style.background = 'rgba(107, 114, 128, 0.2)';
            }}
            onMouseOut={(e) => {
              e.target.style.background = 'rgba(107, 114, 128, 0.1)';
            }}
          >
            <FiX size={16} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          {getFormFields()}
          
          <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
            <button 
              type="submit" 
              style={{
                flex: 1,
                background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '0.75rem 1.5rem',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 16px rgba(79, 70, 229, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
              onMouseOver={(e) => {
                e.target.style.transform = 'translateY(-1px)';
                e.target.style.boxShadow = '0 6px 20px rgba(79, 70, 229, 0.4)';
              }}
              onMouseOut={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 16px rgba(79, 70, 229, 0.3)';
              }}
            >
              <FiSave size={16} />
              {item && item.id ? 'Update' : 'Create'}
            </button>
            <button 
              type="button" 
              onClick={onCancel}
              style={{
                flex: 1,
                background: 'rgba(107, 114, 128, 0.1)',
                color: '#6b7280',
                border: '1px solid rgba(107, 114, 128, 0.2)',
                borderRadius: '8px',
                padding: '0.75rem 1.5rem',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
              onMouseOver={(e) => {
                e.target.style.background = 'rgba(107, 114, 128, 0.2)';
                e.target.style.transform = 'translateY(-1px)';
              }}
              onMouseOut={(e) => {
                e.target.style.background = 'rgba(107, 114, 128, 0.1)';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              <FiX size={16} />
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ManagementPage;
