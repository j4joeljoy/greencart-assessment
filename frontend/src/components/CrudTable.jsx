import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const CrudTable = ({ title, endpoint, fields, onRefresh }) => {
  const [data, setData] = useState([]);
  const [formData, setFormData] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const { isAuthenticated } = useAuth();

  const accessToken = localStorage.getItem('accessToken');

  const fetchData = async () => {
    if (!isAuthenticated) return;
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/${endpoint}/`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch ${title}.`);
      }
      const jsonData = await response.json();
      setData(jsonData);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchData();
  }, [isAuthenticated, endpoint, onRefresh]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const url = editingId 
      ? `http://127.0.0.1:8000/api/${endpoint}/${editingId}/` 
      : `http://127.0.0.1:8000/api/${endpoint}/`;
    
    const method = editingId ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `Failed to save ${title}.`);
      }

      setFormData({});
      setEditingId(null);
      fetchData(); // Refresh the data
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (item) => {
    setFormData(item);
    setEditingId(item.id);
  };

  const handleDelete = async (itemId) => {
    setError('');
    const confirmed = window.confirm(`Are you sure you want to delete this ${title} item?`);
    if (!confirmed) return;

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/${endpoint}/${itemId}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to delete ${title}.`);
      }

      fetchData(); // Refresh the data
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <h2>{editingId ? `Edit ${title}` : `Add New ${title}`}</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        {fields.map(field => (
          <div key={field.name}>
            <label>{field.label}:</label>
            <input
              type={field.type}
              name={field.name}
              value={formData[field.name] || ''}
              onChange={handleChange}
              required={field.required}
            />
          </div>
        ))}
        <button type="submit">{editingId ? 'Update' : 'Create'}</button>
        {editingId && <button onClick={() => setEditingId(null)}>Cancel</button>}
      </form>
      
      <h3 style={{ marginTop: '20px' }}>{title} List</h3>
      <table>
        <thead>
          <tr>
            {fields.map(field => (
              <th key={field.name}>{field.label}</th>
            ))}
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.map(item => (
            <tr key={item.id}>
              {fields.map(field => (
                <td key={field.name}>{item[field.name]}</td>
              ))}
              <td>
                <button onClick={() => handleEdit(item)}>Edit</button>
                <button onClick={() => handleDelete(item.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CrudTable;