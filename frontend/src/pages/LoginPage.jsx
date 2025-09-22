import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(''); // State for handling login errors
  const navigate = useNavigate(); // Hook for programmatic navigation
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Clear previous errors

    try {
      const response = await fetch('http://127.0.0.1:8000/api/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Login failed');
      }

      const data = await response.json();
      localStorage.setItem('accessToken', data.access);
      localStorage.setItem('refreshToken', data.refresh);

      // Update auth context
      login(data.access);

      console.log('Login successful!', data);

      // Navigate to the Dashboard page after successful login
      navigate('/dashboard');

    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="login-page-container">
      <div className="login-card card fade-in">
        <div className="card-header text-center">
          <div className="login-icon">🚚</div>
          <h1 className="login-title">GreenCart</h1>
          <p className="login-subtitle">Delivery Management System</p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">
              <span className="input-icon">👤</span>
              Username
            </label>
            <input
              type="text"
              className="form-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              required
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">
              <span className="input-icon">🔒</span>
              Password
            </label>
            <input
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>
          
          {error && (
            <div className="error-message">⚠️ {error}</div>
          )}
          
          <button 
            type="submit" 
            className="btn btn-primary"
          >
            <span className="button-icon">🚀</span>
            Sign In
          </button>
        </form>
        
        <div className="demo-credentials">
          <strong>Demo Credentials:</strong><br />
          Username: admin<br />
          Password: admin
        </div>
      </div>
    </div>
  );
};

export default LoginPage;