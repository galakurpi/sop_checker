import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createList, getUsers } from '../services/api';

const CreateList = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assigned_user_id: '',
    items: ['']
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      console.log('Fetching users for create form...');
      const usersData = await getUsers();
      console.log('Users for form:', usersData);
      setUsers(usersData || []);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users. Make sure the backend server is running.');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleItemChange = (index, value) => {
    const newItems = [...formData.items];
    newItems[index] = value;
    setFormData(prev => ({
      ...prev,
      items: newItems
    }));
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, '']
    }));
  };

  const removeItem = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      items: newItems
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }
    
    if (!formData.assigned_user_id) {
      setError('Please select a user to assign this list to');
      return;
    }

    const filteredItems = formData.items.filter(item => item.trim() !== '');
    
    if (filteredItems.length === 0) {
      setError('Please add at least one item to the list');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const listData = {
        ...formData,
        assigned_user_id: parseInt(formData.assigned_user_id),
        created_by_id: 1, // Default to admin user
        items: filteredItems
      };
      
      console.log('Creating list with data:', listData);
      const newList = await createList(listData);
      console.log('Created list:', newList);
      navigate(`/list/${newList.id}`);
    } catch (err) {
      console.error('Error creating list:', err);
      setError('Failed to create list. Please check the console for details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2>Create New SOP List</h2>
      
      {error && <div className="error">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Title *</label>
          <input
            type="text"
            id="title"
            name="title"
            className="form-control"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="Enter list title"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            className="form-control"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Enter list description (optional)"
            rows="3"
          />
        </div>

        <div className="form-group">
          <label htmlFor="assigned_user_id">Assign to User *</label>
          <select
            id="assigned_user_id"
            name="assigned_user_id"
            className="form-control"
            value={formData.assigned_user_id}
            onChange={handleInputChange}
            required
          >
            <option value="">Select a user...</option>
            {users.map(user => (
              <option key={user.id} value={user.id}>
                {user.first_name || 'Unknown'} {user.last_name || 'User'} (@{user.username || 'unknown'})
              </option>
            ))}
          </select>
          {users.length === 0 && (
            <p style={{ color: '#666', fontSize: '0.9em', marginTop: '5px' }}>
              No users available. Make sure the backend is running.
            </p>
          )}
        </div>

        <div className="form-group">
          <label>Checklist Items</label>
          {formData.items.map((item, index) => (
            <div key={index} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
              <input
                type="text"
                className="form-control"
                value={item}
                onChange={(e) => handleItemChange(index, e.target.value)}
                placeholder={`Item ${index + 1}`}
              />
              {formData.items.length > 1 && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => removeItem(index)}
                  style={{ flexShrink: 0 }}
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          
          <button
            type="button"
            className="btn btn-secondary"
            onClick={addItem}
            style={{ marginTop: '10px' }}
          >
            Add Item
          </button>
        </div>

        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
          <button
            type="submit"
            className="btn btn-success"
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create List'}
          </button>
          
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate('/')}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateList; 