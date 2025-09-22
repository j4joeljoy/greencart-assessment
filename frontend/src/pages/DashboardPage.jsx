import React, { useEffect, useState } from 'react';
import { useSimulation } from '../context/SimulationContext';
import { useAuth } from '../context/AuthContext';
import DeliveryChart from '../components/DeliveryChart';
import FuelCostChart from '../components/FuelCostChart';
import KPITrendChart from '../components/KPITrendChart';
import { 
  FiTrendingUp, 
  FiClock, 
  FiCheckCircle, 
  FiAlertTriangle,
  FiDollarSign,
  FiBarChart3,
  FiActivity,
  FiRefreshCw
} from '../components/Icons';

const DashboardPage = () => {
  const { simulationResults } = useSimulation();
  const { isAuthenticated } = useAuth();
  const [kpiData, setKpiData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [historicalData, setHistoricalData] = useState([]);
  const [currentRunId, setCurrentRunId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Fetch historical data for trend charts
  const fetchHistoricalData = async () => {
    if (!isAuthenticated) return;

    const accessToken = localStorage.getItem('accessToken');
    try {
      const response = await fetch('http://127.0.0.1:8000/api/analytics/historical-data/', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setHistoricalData(data.trend_data || []);
      }
    } catch (err) {
      console.error('Error fetching historical data:', err);
    }
  };

  // Refresh dashboard data
  const refreshDashboard = async () => {
    setRefreshing(true);
    await fetchHistoricalData();
    setRefreshing(false);
  };

  // Use useEffect to fetch initial or latest results on component mount
  useEffect(() => {
    const fetchLatestResults = async () => {
      if (!isAuthenticated) return;

      const accessToken = localStorage.getItem('accessToken');
      try {
        const response = await fetch('http://127.0.0.1:8000/api/orders/', {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        });
        if (!response.ok) {
          throw new Error('Failed to fetch latest simulation results.');
        }
        const orders = await response.json();
        
        // This logic simulates calculating KPIs from the latest saved orders
        let totalProfit = 0;
        let onTimeDeliveries = 0;
        let lateDeliveries = 0;
        let totalFuelCost = 0;

        orders.forEach(order => {
            totalProfit += parseFloat(order.profit);
            totalFuelCost += parseFloat(order.fuel_cost);
            if (order.is_late) {
                lateDeliveries += 1;
            } else {
                onTimeDeliveries += 1;
            }
        });
        
        const efficiencyScore = (onTimeDeliveries / (onTimeDeliveries + lateDeliveries)) * 100;

        setKpiData({
            total_profit: totalProfit.toFixed(2),
            efficiency_score: efficiencyScore.toFixed(2),
            on_time_deliveries: onTimeDeliveries,
            late_deliveries: lateDeliveries,
            fuel_cost_breakdown: totalFuelCost.toFixed(2),
        });

        // Fetch historical data for trend charts
        fetchHistoricalData();

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (simulationResults) {
        // Use simulation results directly from context
        console.log('Updating dashboard with simulation results:', simulationResults);
        setKpiData({
            total_profit: typeof simulationResults.total_profit === 'number' 
                ? simulationResults.total_profit.toFixed(2) 
                : simulationResults.total_profit,
            efficiency_score: typeof simulationResults.efficiency_score === 'number' 
                ? simulationResults.efficiency_score.toFixed(2) 
                : simulationResults.efficiency_score,
            on_time_deliveries: simulationResults.on_time_deliveries,
            late_deliveries: simulationResults.late_deliveries,
            fuel_cost_breakdown: typeof simulationResults.fuel_cost_breakdown === 'number' 
                ? simulationResults.fuel_cost_breakdown.toFixed(2) 
                : simulationResults.fuel_cost_breakdown,
        });
        setCurrentRunId(simulationResults.run_id);
        setLoading(false);
        // Fetch historical data for trend charts
        fetchHistoricalData();
    } else {
        fetchLatestResults();
    }
  }, [simulationResults, isAuthenticated]);

  // Separate useEffect to handle simulation results updates
  useEffect(() => {
    if (simulationResults) {
      console.log('Simulation results changed, updating dashboard:', simulationResults);
      setIsUpdating(true);
      
      // Update KPI data with new simulation results
      setKpiData({
        total_profit: typeof simulationResults.total_profit === 'number' 
          ? simulationResults.total_profit.toFixed(2) 
          : simulationResults.total_profit,
        efficiency_score: typeof simulationResults.efficiency_score === 'number' 
          ? simulationResults.efficiency_score.toFixed(2) 
          : simulationResults.efficiency_score,
        on_time_deliveries: simulationResults.on_time_deliveries,
        late_deliveries: simulationResults.late_deliveries,
        fuel_cost_breakdown: typeof simulationResults.fuel_cost_breakdown === 'number' 
          ? simulationResults.fuel_cost_breakdown.toFixed(2) 
          : simulationResults.fuel_cost_breakdown,
      });
      setCurrentRunId(simulationResults.run_id);
      setLoading(false);
      
      // Fetch historical data for trend charts
      fetchHistoricalData();
      
      // Clear updating state after a short delay
      setTimeout(() => {
        setIsUpdating(false);
      }, 1000);
    }
  }, [simulationResults]);

  if (loading) {
      return (
        <div className="dashboard-loading-container">
          <div className="card dashboard-loading-card">
            <div className="spinner dashboard-loading-spinner"></div>
            <h3 className="dashboard-loading-title">
              Loading Dashboard
            </h3>
            <p className="dashboard-loading-text">
              Fetching latest simulation data...
            </p>
          </div>
        </div>
      );
  }
  
  if (!kpiData) {
      return (
        <div className="container page-container">
          <div className="fade-in">
            <div className="page-header">
              <div className="page-header-content">
                <div className="page-header-icon-wrapper dashboard-header-icon">
                  <FiBarChart3 size={24} color="white" />
                </div>
                <div>
                  <h1 className="page-title">
                    Analytics Dashboard
                  </h1>
                  <p className="page-subtitle">
                    Delivery Performance Overview
                  </p>
                </div>
              </div>
            </div>
            
            <div className="card" style={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              textAlign: 'center',
              padding: '3rem 2rem',
              borderRadius: '16px'
            }}>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '20px',
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.05) 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.5rem',
                boxShadow: '0 8px 32px rgba(16, 185, 129, 0.1)'
              }}>
                <FiActivity size={32} color="#10b981" />
              </div>
              <h2 style={{ 
                margin: '0 0 1rem 0', 
                color: 'var(--text-primary)',
                fontSize: '1.5rem',
                fontWeight: '600'
              }}>
                No Simulation Data Available
              </h2>
              <p style={{ 
                margin: '0 0 2rem 0', 
                color: 'var(--text-secondary)',
                fontSize: '1rem'
              }}>
                Run a simulation to see your delivery performance metrics and analytics.
              </p>
              <a 
                href="/simulate" 
                className="btn btn-primary"
                style={{ 
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  textDecoration: 'none',
                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '0.75rem 1.5rem',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 8px 32px rgba(245, 158, 11, 0.3)'
                }}
                onMouseOver={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 12px 40px rgba(245, 158, 11, 0.4)';
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 8px 32px rgba(245, 158, 11, 0.3)';
                }}
              >
                <FiActivity size={16} />
                Run Simulation
              </a>
            </div>
          </div>
        </div>
      );
  }

  return (
    <div className="container page-container">
      <div className="fade-in">
        <div className="page-header">
          <div className="page-header-content">
            <div className="page-header-icon-wrapper dashboard-header-icon">
              <FiBarChart3 size={24} color="white" />
            </div>
            <div>
              <h1 className="page-title">
                Analytics Dashboard
              </h1>
              <p className="page-subtitle dashboard-subtitle-wrapper">
                Delivery Performance Overview
                {isUpdating && (
                  <span className="dashboard-updating-badge">
                    <div className="dashboard-updating-dot"></div>
                    Updating...
                  </span>
                )}
              </p>
            </div>
            <button
              onClick={refreshDashboard}
              disabled={refreshing}
              className="dashboard-refresh-button"
            >
              <FiRefreshCw size={16} className={refreshing ? 'dashboard-refresh-icon' : ''} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 mb-6">
          <div className="kpi-card">
            <div className="kpi-card-content">
              <div className="kpi-icon-wrapper kpi-profit-icon">
                <FiDollarSign size={24} color="white" />
              </div>
              <div>
                <h3 className="kpi-title">
                  Total Profit
                </h3>
                <p className="kpi-value kpi-profit-value">
                  ₹{kpiData.total_profit}
                </p>
                {currentRunId && (
                  <p className="kpi-run-id">
                    Run ID: {currentRunId}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-card-content">
              <div className="kpi-icon-wrapper kpi-efficiency-icon">
                <FiTrendingUp size={24} color="white" />
              </div>
              <div>
                <h3 className="kpi-title">
                  Efficiency Score
                </h3>
                <p className="kpi-value kpi-efficiency-value">
                  {kpiData.efficiency_score}%
                </p>
                {currentRunId && (
                  <p className="kpi-run-id">
                    Run ID: {currentRunId}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-2 mb-6">
          <div className="kpi-card">
            <div className="kpi-card-content">
              <div className="kpi-icon-wrapper kpi-ontime-icon">
                <FiCheckCircle size={24} color="white" />
              </div>
              <div>
                <h3 className="kpi-title">
                  On-Time Deliveries
                </h3>
                <p className="kpi-value kpi-ontime-value">
                  {kpiData.on_time_deliveries}
                </p>
              </div>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-card-content">
              <div className="kpi-icon-wrapper kpi-late-icon">
                <FiClock size={24} color="white" />
              </div>
              <div>
                <h3 className="kpi-title">
                  Late Deliveries
                </h3>
                <p className="kpi-value kpi-late-value">
                  {kpiData.late_deliveries}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Trend Charts */}
        <div className="grid grid-cols-2 mb-6">
          <div className="chart-card">
            <KPITrendChart
              data={historicalData}
              title="Total Profit"
              dataKey="total_profit"
              color="#10b981"
              yAxisLabel="Profit (₹)"
              formatValue={(value) => `₹${value.toFixed(2)}`}
            />
          </div>
          <div className="chart-card">
            <KPITrendChart
              data={historicalData}
              title="Efficiency Score"
              dataKey="efficiency_score"
              color="#3b82f6"
              yAxisLabel="Efficiency (%)"
              formatValue={(value) => `${value.toFixed(1)}%`}
            />
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-2">
          <div className="chart-card">
            <DeliveryChart
              onTime={kpiData.on_time_deliveries}
              late={kpiData.late_deliveries}
            />
          </div>
          <div className="chart-card">
            <FuelCostChart fuelCost={kpiData.fuel_cost_breakdown} />
          </div>
        </div>

      </div>
    </div>
  );
};

export default DashboardPage;