import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const FuelCostChart = ({ fuelCost }) => {
  const data = [
    { name: 'Total Fuel Cost', cost: fuelCost || 0 }
  ];

  // If no data, show a message
  if (!fuelCost || fuelCost === 0) {
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
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⛽</div>
          <div>No fuel cost data available</div>
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
        <span>⛽</span>
        Fuel Cost Analysis
      </h4>
      <ResponsiveContainer>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
          <XAxis 
            dataKey="name" 
            tick={{ fontSize: 12, fill: 'var(--text-secondary)' }}
            axisLine={{ stroke: 'var(--border-color)' }}
          />
          <YAxis 
            tick={{ fontSize: 12, fill: 'var(--text-secondary)' }}
            axisLine={{ stroke: 'var(--border-color)' }}
            tickFormatter={(value) => `₹${value}`}
          />
          <Tooltip 
            formatter={(value) => [`₹${value}`, 'Total Cost']}
            contentStyle={{
              background: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius)',
              boxShadow: 'var(--shadow-md)'
            }}
          />
          <Bar 
            dataKey="cost" 
            fill="url(#fuelGradient)"
            radius={[4, 4, 0, 0]}
          />
          <defs>
            <linearGradient id="fuelGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
          </defs>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default FuelCostChart;