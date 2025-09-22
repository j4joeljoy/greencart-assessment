import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const COLORS = ['#10b981', '#ef4444']; // Green for on-time, Red for late

const DeliveryChart = ({ onTime, late }) => {
  const data = [
    { name: 'On-time Deliveries', value: onTime || 0 },
    { name: 'Late Deliveries', value: late || 0 },
  ];

  // If no data, show a message
  if ((onTime || 0) + (late || 0) === 0) {
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
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📊</div>
          <div>No delivery data available</div>
        </div>
      </div>
    );
  }

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
        <span>📊</span>
        Delivery Performance
      </h4>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value, name) => [value, name]}
            contentStyle={{
              background: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius)',
              boxShadow: 'var(--shadow-md)'
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DeliveryChart;