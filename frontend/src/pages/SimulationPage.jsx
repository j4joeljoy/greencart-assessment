import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSimulation } from '../context/SimulationContext';
import { 
  FiPlay, 
  FiUsers, 
  FiClock, 
  FiSettings, 
  FiCheckCircle, 
  FiAlertTriangle,
  FiTrendingUp,
  FiZap
} from '../components/Icons';

const SimulationPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { updateResults } = useSimulation();
  const [numDrivers, setNumDrivers] = useState('10');
  const [startTime, setStartTime] = useState('09:00');
  const [maxHours, setMaxHours] = useState('8');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRunSimulation = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setIsLoading(true);

    // Validate form fields
    if (!numDrivers || numDrivers === '') {
      setError('Please enter the number of available drivers.');
      setIsLoading(false);
      return;
    }

    if (!startTime || startTime === '') {
      setError('Please select a route start time.');
      setIsLoading(false);
      return;
    }

    if (!maxHours || maxHours === '') {
      setError('Please enter the maximum hours per driver per day.');
      setIsLoading(false);
      return;
    }

    if (!isAuthenticated) {
      setError('You must be logged in to run a simulation.');
      setIsLoading(false);
      return;
    }

    const accessToken = localStorage.getItem('accessToken');

    if (!accessToken) {
        setError('Access token not found. Please log in again.');
        setIsLoading(false);
        return;
    }

    try {
      const requestData = {
        num_drivers: parseInt(numDrivers),
        start_time: new Date().toISOString().split('T')[0] + ' ' + startTime + ':00', // Format: YYYY-MM-DD HH:MM:SS
        max_hours_per_day: parseInt(maxHours),
      };
      
      console.log('Simulation request data:', requestData);
      
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'}/api/simulate/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Simulation error:', errorData);
        throw new Error(errorData.error || `Simulation failed with status ${response.status}`);
      }

      const results = await response.json();
      console.log('Simulation results:', results);
      setSuccessMessage('Simulation run successfully! KPIs updated on the dashboard.');

      // Ensure results are properly formatted
      const formattedResults = {
        total_profit: parseFloat(results.total_profit),
        efficiency_score: parseFloat(results.efficiency_score),
        on_time_deliveries: parseInt(results.on_time_deliveries),
        late_deliveries: parseInt(results.late_deliveries),
        fuel_cost_breakdown: parseFloat(results.fuel_cost_breakdown),
        run_id: results.run_id
      };

      // Update the simulation results in context
      updateResults(formattedResults);

    } catch (error) {
      console.error('Simulation error:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container page-container">
      <div className="fade-in">
        <div className="page-header">
          <div className="page-header-content">
            <div className="page-header-icon-wrapper" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', boxShadow: '0 8px 32px rgba(245, 158, 11, 0.3)' }}>
              <FiPlay size={24} color="white" />
            </div>
            <div>
              <h1 className="page-title">
                Simulation Engine
              </h1>
              <p className="page-subtitle">
                Configure and run delivery simulations
              </p>
            </div>
          </div>
        </div>

        <div className="card" style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          maxWidth: '600px',
          margin: '0 auto'
        }}>
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 16px rgba(139, 92, 246, 0.3)'
              }}>
                <FiSettings size={20} color="white" />
              </div>
              <h2 style={{ 
                margin: 0, 
                fontSize: '1.5rem', 
                fontWeight: '600',
                color: 'var(--text-primary)',
                letterSpacing: '-0.01em'
              }}>
                Simulation Parameters
              </h2>
            </div>
            <p style={{ 
              margin: '0 0 0 3.25rem', 
              color: 'var(--text-secondary)',
              fontSize: '0.875rem'
            }}>
              Set the parameters for your delivery simulation
            </p>
          </div>

          <form onSubmit={handleRunSimulation}>
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <div style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '6px',
                  background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <FiUsers size={12} color="white" />
                </div>
                Number of Available Drivers
              </label>
              <input
                type="number"
                className="form-input"
                value={numDrivers}
                onChange={(e) => setNumDrivers(e.target.value)}
                placeholder="Enter number of drivers"
                min="1"
                max="50"
                required
                style={{
                  padding: '0.75rem 1rem',
                  border: '2px solid rgba(59, 130, 246, 0.2)',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  transition: 'all 0.2s ease',
                  background: 'rgba(59, 130, 246, 0.02)'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#3b82f6';
                  e.target.style.background = 'white';
                  e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(59, 130, 246, 0.2)';
                  e.target.style.background = 'rgba(59, 130, 246, 0.02)';
                  e.target.style.boxShadow = 'none';
                }}
              />
              <small style={{ 
                color: 'var(--text-secondary)', 
                fontSize: '0.75rem',
                marginTop: '0.5rem',
                display: 'block'
              }}>
                How many drivers are available for delivery?
              </small>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <div style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '6px',
                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <FiClock size={12} color="white" />
                </div>
                Route Start Time
              </label>
              <input
                type="time"
                className="form-input"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
                style={{
                  padding: '0.75rem 1rem',
                  border: '2px solid rgba(245, 158, 11, 0.2)',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  transition: 'all 0.2s ease',
                  background: 'rgba(245, 158, 11, 0.02)'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#f59e0b';
                  e.target.style.background = 'white';
                  e.target.style.boxShadow = '0 0 0 3px rgba(245, 158, 11, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(245, 158, 11, 0.2)';
                  e.target.style.background = 'rgba(245, 158, 11, 0.02)';
                  e.target.style.boxShadow = 'none';
                }}
              />
              <small style={{ 
                color: 'var(--text-secondary)', 
                fontSize: '0.75rem',
                marginTop: '0.5rem',
                display: 'block'
              }}>
                What time should the delivery routes start?
              </small>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <div style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '6px',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <FiClock size={12} color="white" />
                </div>
                Max Hours Per Driver Per Day
              </label>
              <input
                type="number"
                className="form-input"
                value={maxHours}
                onChange={(e) => setMaxHours(e.target.value)}
                placeholder="Enter maximum hours"
                min="1"
                max="24"
                required
                style={{
                  padding: '0.75rem 1rem',
                  border: '2px solid rgba(16, 185, 129, 0.2)',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  transition: 'all 0.2s ease',
                  background: 'rgba(16, 185, 129, 0.02)'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#10b981';
                  e.target.style.background = 'white';
                  e.target.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(16, 185, 129, 0.2)';
                  e.target.style.background = 'rgba(16, 185, 129, 0.02)';
                  e.target.style.boxShadow = 'none';
                }}
              />
              <small style={{ 
                color: 'var(--text-secondary)', 
                fontSize: '0.75rem',
                marginTop: '0.5rem',
                display: 'block'
              }}>
                Maximum working hours per driver per day
              </small>
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
                boxShadow: '0 2px 8px rgba(16, 185, 129, 0.1)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
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
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => navigate('/dashboard')}
                    style={{
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '0.5rem 1rem',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                    onMouseOver={(e) => {
                      e.target.style.transform = 'translateY(-1px)';
                      e.target.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)';
                    }}
                    onMouseOut={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = 'none';
                    }}
                  >
                    <FiTrendingUp size={12} />
                    View Dashboard
                  </button>
                  <button
                    onClick={() => {
                      setSuccessMessage('');
                      setError('');
                    }}
                    style={{
                      background: 'rgba(16, 185, 129, 0.1)',
                      color: '#059669',
                      border: '1px solid rgba(16, 185, 129, 0.2)',
                      borderRadius: '8px',
                      padding: '0.5rem 1rem',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseOver={(e) => {
                      e.target.style.background = 'rgba(16, 185, 129, 0.2)';
                    }}
                    onMouseOut={(e) => {
                      e.target.style.background = 'rgba(16, 185, 129, 0.1)';
                    }}
                  >
                    Run Another
                  </button>
                </div>
              </div>
            )}

            <button 
              type="submit" 
              disabled={isLoading}
              style={{ 
                width: '100%', 
                fontSize: '1rem', 
                padding: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.75rem',
                background: isLoading 
                  ? 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)'
                  : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontWeight: '600',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: isLoading 
                  ? '0 4px 16px rgba(156, 163, 175, 0.3)'
                  : '0 8px 32px rgba(245, 158, 11, 0.3)',
                opacity: isLoading ? 0.7 : 1
              }}
              onMouseOver={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 12px 40px rgba(245, 158, 11, 0.4)';
                }
              }}
              onMouseOut={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 8px 32px rgba(245, 158, 11, 0.3)';
                }
              }}
            >
              <FiPlay size={20} />
              {isLoading ? 'Running Simulation...' : 'Run Simulation'}
            </button>
          </form>

          <div style={{
            marginTop: '2rem',
            padding: '1.5rem',
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.05) 0%, rgba(124, 58, 237, 0.02) 100%)',
            borderRadius: '12px',
            fontSize: '0.875rem',
            color: 'var(--text-secondary)',
            border: '1px solid rgba(139, 92, 246, 0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{
                width: '24px',
                height: '24px',
                borderRadius: '6px',
                background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <FiZap size={14} color="white" />
              </div>
              <h4 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1rem', fontWeight: '600' }}>
                Simulation Information
              </h4>
            </div>
            <ul style={{ margin: 0, paddingLeft: '1.5rem', listStyle: 'none' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#8b5cf6', flexShrink: 0 }}></div>
                Simulation will calculate delivery times based on traffic conditions
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#8b5cf6', flexShrink: 0 }}></div>
                Results will be displayed on the Dashboard
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#8b5cf6', flexShrink: 0 }}></div>
                KPIs include profit, efficiency, and delivery performance
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimulationPage;