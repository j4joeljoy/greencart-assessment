import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const KPITrendChart = ({ data, title, dataKey, color, yAxisLabel, formatValue }) => {
  // If no data, show a message
  if (!data || data.length === 0) {
    return (
      <div style={{
        height: 300,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '12px',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        color: 'var(--text-secondary)',
        fontSize: '0.875rem'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📈</div>
          <div>No historical data available</div>
        </div>
      </div>
    );
  }

  // Format data for the chart
  const chartData = data.map((item, index) => ({
    ...item,
    // Create a simplified timestamp for display
    displayTime: new Date(item.timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }),
    // Add index for better sorting
    index: index
  })).reverse(); // Reverse to show oldest to newest

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius)',
          boxShadow: 'var(--shadow-md)',
          padding: '0.75rem',
          fontSize: '0.875rem'
        }}>
          <p style={{ margin: '0 0 0.5rem 0', fontWeight: '600', color: 'var(--text-primary)' }}>
            {label}
          </p>
          <p style={{ margin: '0', color: 'var(--text-secondary)' }}>
            <span style={{ color: color, fontWeight: '600' }}>
              {title}: {formatValue ? formatValue(data[dataKey]) : data[dataKey]}
            </span>
          </p>
          <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
            Run ID: {data.run_id}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ width: '100%', height: 300 }}>
      <h4 style={{ 
        margin: '0 0 1rem 0', 
        fontSize: '1.125rem', 
        fontWeight: '600',
        color: 'var(--text-primary)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
      }}>
        <span>📈</span>
        {title} Trend
      </h4>
      <ResponsiveContainer>
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 0, 0, 0.1)" />
          <XAxis 
            dataKey="displayTime" 
            stroke="var(--text-secondary)"
            fontSize={12}
            tick={{ fill: 'var(--text-secondary)' }}
          />
          <YAxis 
            stroke="var(--text-secondary)"
            fontSize={12}
            tick={{ fill: 'var(--text-secondary)' }}
            label={{ 
              value: yAxisLabel, 
              angle: -90, 
              position: 'insideLeft',
              style: { textAnchor: 'middle', fill: 'var(--text-secondary)' }
            }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line 
            type="monotone" 
            dataKey={dataKey} 
            stroke={color} 
            strokeWidth={3}
            dot={{ fill: color, strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: color, strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default KPITrendChart;
