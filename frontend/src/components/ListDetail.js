import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getList, toggleItemCheck, deleteList } from '../services/api';

const ListDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [list, setList] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchList();
  }, [id]);

  const fetchList = async () => {
    try {
      setLoading(true);
      console.log('Fetching list detail for id:', id);
      const listData = await getList(id);
      console.log('List detail data:', listData);
      setList(listData);
    } catch (err) {
      console.error('Error fetching list:', err);
      setError('Failed to load list. Make sure the backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleItem = async (itemId) => {
    try {
      const updatedItem = await toggleItemCheck(itemId);
      
      // Update the item in the local state
      setList(prevList => ({
        ...prevList,
        items: prevList.items?.map(item =>
          item.id === itemId ? { ...item, ...updatedItem } : item
        ) || []
      }));
    } catch (err) {
      console.error('Failed to toggle item:', err);
      setError('Failed to update item');
    }
  };

  const handleDeleteList = async () => {
    if (window.confirm('Are you sure you want to delete this list? This action cannot be undone.')) {
      try {
        await deleteList(id);
        navigate('/');
      } catch (err) {
        console.error('Error deleting list:', err);
        setError('Failed to delete list');
      }
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!list) return <div className="error">List not found</div>;

  const items = list.items || [];
  const completedItems = items.filter(item => item.is_checked).length;
  const totalItems = items.length;
  const progressPercentage = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

  return (
    <div>
      {/* Header */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '20px' }}>
          <div>
            <h2>{list.title || 'Untitled List'}</h2>
            {list.description && (
              <p style={{ color: '#666', margin: '10px 0' }}>{list.description}</p>
            )}
            <div style={{ fontSize: '0.9em', color: '#888' }}>
              <p>Assigned to: <strong>
                {list.assigned_user ? 
                  `${list.assigned_user.first_name || 'Unknown'} ${list.assigned_user.last_name || 'User'}` : 
                  'Unknown User'
                }
              </strong></p>
              <p>Created by: <strong>
                {list.created_by ? 
                  `${list.created_by.first_name || 'Unknown'} ${list.created_by.last_name || 'User'}` : 
                  'Unknown User'
                }
              </strong></p>
              <p>Created: {list.created_at ? new Date(list.created_at).toLocaleDateString() : 'Unknown'}</p>
            </div>
          </div>
          
          <div style={{ textAlign: 'right' }}>
            <span style={{ 
              padding: '6px 12px', 
              borderRadius: '4px', 
              fontSize: '0.9em',
              backgroundColor: list.is_completed ? '#28a745' : '#ffc107',
              color: list.is_completed ? 'white' : 'black'
            }}>
              {list.is_completed ? 'Completed' : 'In Progress'}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
            <span>Progress</span>
            <span>{completedItems}/{totalItems} items ({Math.round(progressPercentage)}%)</span>
          </div>
          <div style={{ 
            width: '100%', 
            height: '8px', 
            backgroundColor: '#e9ecef', 
            borderRadius: '4px',
            overflow: 'hidden'
          }}>
            <div style={{ 
              width: `${progressPercentage}%`, 
              height: '100%', 
              backgroundColor: '#28a745',
              transition: 'width 0.3s ease'
            }} />
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <Link to="/" className="btn btn-secondary" style={{ textDecoration: 'none' }}>
            ← Back to Dashboard
          </Link>
          <button 
            onClick={handleDeleteList}
            className="btn"
            style={{ backgroundColor: '#dc3545', color: 'white' }}
          >
            Delete List
          </button>
        </div>
      </div>

      {/* Checklist Items */}
      <div className="card">
        <h3>Checklist Items</h3>
        
        {items.length === 0 ? (
          <p>No items in this list.</p>
        ) : (
          <div>
            {items.map(item => (
              <div 
                key={item.id} 
                className={`checkbox-item ${item.is_checked ? 'checked' : ''}`}
              >
                <input
                  type="checkbox"
                  checked={item.is_checked || false}
                  onChange={() => handleToggleItem(item.id)}
                />
                <span style={{ 
                  textDecoration: item.is_checked ? 'line-through' : 'none',
                  color: item.is_checked ? '#666' : '#333',
                  flex: 1
                }}>
                  {item.text || 'Untitled Item'}
                </span>
                {item.checked_at && (
                  <span style={{ fontSize: '0.8em', color: '#888' }}>
                    Completed: {new Date(item.checked_at).toLocaleString()}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ListDetail; 