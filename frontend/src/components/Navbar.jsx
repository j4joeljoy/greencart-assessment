import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiBarChart3, FiPlay, FiUsers, FiLogOut, FiTruck } from '../components/Icons';

const Navbar = () => {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!isAuthenticated) {
    return null;
  }

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: FiBarChart3, color: '#10b981' },
    { path: '/simulate', label: 'Simulation', icon: FiPlay, color: '#f59e0b' },
    { path: '/management', label: 'Management', icon: FiUsers, color: '#3b82f6' },
  ];

  return (
    <nav style={{
      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.85) 100%)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
      padding: '1.5rem 0',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
      borderRadius: '0 0 24px 24px',
      margin: '0 1rem',
      border: '1px solid rgba(255, 255, 255, 0.2)'
    }}>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '3rem' }}>
          <Link 
            to="/dashboard" 
            style={{ 
              fontSize: '1.75rem', 
              fontWeight: '700', 
              color: '#1f2937',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              letterSpacing: '-0.02em'
            }}
          >
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 32px rgba(16, 185, 129, 0.3)'
            }}>
              <FiTruck size={20} color="white" />
            </div>
            GreenCart
          </Link>
          <ul style={{ 
            display: 'flex', 
            listStyle: 'none', 
            margin: 0, 
            gap: '0.5rem',
            background: 'rgba(0, 0, 0, 0.02)',
            borderRadius: '16px',
            padding: '4px'
          }}>
            {navItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.875rem 1.25rem',
                      borderRadius: '12px',
                      textDecoration: 'none',
                      color: isActive ? '#1f2937' : '#6b7280',
                      fontWeight: isActive ? '600' : '500',
                      background: isActive ? 'white' : 'transparent',
                      transition: 'all 0.3s ease-in-out',
                      boxShadow: isActive ? '0 4px 16px rgba(0, 0, 0, 0.1)' : 'none',
                      position: 'relative',
                      fontSize: '0.875rem'
                    }}
                    onMouseOver={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.5)';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                      }
                    }}
                    onMouseOut={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }
                    }}
                  >
                    <IconComponent 
                      size={18} 
                      color={isActive ? item.color : '#6b7280'} 
                    />
                    {item.label}
                    {isActive && (
                      <div style={{
                        position: 'absolute',
                        bottom: '-2px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '20px',
                        height: '3px',
                        background: `linear-gradient(135deg, ${item.color} 0%, ${item.color}dd 100%)`,
                        borderRadius: '2px'
                      }} />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
        <button
          onClick={handleLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.875rem 1.25rem',
            background: 'linear-gradient(135deg, rgba(107, 114, 128, 0.1) 0%, rgba(75, 85, 99, 0.05) 100%)',
            color: '#6b7280',
            border: '1px solid rgba(107, 114, 128, 0.2)',
            borderRadius: '12px',
            fontSize: '0.875rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            textDecoration: 'none'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(107, 114, 128, 0.2) 0%, rgba(75, 85, 99, 0.1) 100%)';
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 4px 16px rgba(107, 114, 128, 0.2)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(107, 114, 128, 0.1) 0%, rgba(75, 85, 99, 0.05) 100%)';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <FiLogOut size={18} />
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;