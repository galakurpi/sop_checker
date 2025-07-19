import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getUserLists, getUsers } from '../services/api';

const UserLists = () => {
  const { userId } = useParams();
  const [lists, setLists] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, [userId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      console.log('Fetching user lists for userId:', userId);
      
      const [listsData, usersData] = await Promise.all([
        getUserLists(userId),
        getUsers()
      ]);
      
      console.log('User lists data:', listsData);
      console.log('Users data:', usersData);
      
      setLists(listsData || []);
      const userData = usersData?.find(u => u.id === parseInt(userId));
      setUser(userData);
    } catch (err) {
      console.error('Error fetching user lists:', err);
      setError('Failed to load user lists. Make sure the backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!user) return <div className="error">User not found</div>;

  return (
    <div>
      {/* Header */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2>Lists for {user.first_name || 'Unknown'} {user.last_name || 'User'}</h2>
            <p style={{ color: '#666' }}>@{user.username || 'unknown'} • {user.email || 'no email'}</p>
          </div>
          <Link to="/" className="btn btn-secondary" style={{ textDecoration: 'none' }}>
            ← Back to Dashboard
          </Link>
        </div>
      </div>

      {/* Statistics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <div className="card">
          <h3>Total Lists</h3>
          <p style={{ fontSize: '2em', color: '#007bff' }}>{lists.length}</p>
        </div>
        <div className="card">
          <h3>Completed</h3>
          <p style={{ fontSize: '2em', color: '#28a745' }}>
            {lists.filter(list => list.is_completed).length}
          </p>
        </div>
        <div className="card">
          <h3>In Progress</h3>
          <p style={{ fontSize: '2em', color: '#ffc107' }}>
            {lists.filter(list => !list.is_completed).length}
          </p>
        </div>
        <div className="card">
          <h3>Completion Rate</h3>
          <p style={{ fontSize: '2em', color: '#6c757d' }}>
            {lists.length > 0 ? Math.round((lists.filter(list => list.is_completed).length / lists.length) * 100) : 0}%
          </p>
        </div>
      </div>

      {/* Lists */}
      <div className="card">
        <h3>Assigned Lists</h3>
        
        {lists.length === 0 ? (
          <p>No lists assigned to this user yet.</p>
        ) : (
          <div style={{ display: 'grid', gap: '15px' }}>
            {lists.map(list => {
              const items = list.items || [];
              const completedItems = items.filter(item => item.is_checked).length;
              const totalItems = items.length;
              const progressPercentage = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;
              
              return (
                <div key={list.id} style={{ 
                  padding: '20px', 
                  border: '1px solid #ddd', 
                  borderRadius: '8px',
                  backgroundColor: list.is_completed ? '#f8f9fa' : 'white',
                  borderLeft: `4px solid ${list.is_completed ? '#28a745' : '#007bff'}`
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '15px' }}>
                    <div style={{ flex: 1 }}>
                      <h4>
                        <Link 
                          to={`/list/${list.id}`} 
                          style={{ color: '#007bff', textDecoration: 'none' }}
                        >
                          {list.title || 'Untitled List'}
                        </Link>
                      </h4>
                      {list.description && (
                        <p style={{ color: '#666', margin: '5px 0' }}>{list.description}</p>
                      )}
                      <p style={{ fontSize: '0.9em', color: '#888' }}>
                        Created: {list.created_at ? new Date(list.created_at).toLocaleDateString() : 'Unknown'}
                      </p>
                    </div>
                    
                    <div style={{ textAlign: 'right', minWidth: '120px' }}>
                      <span style={{ 
                        padding: '4px 8px', 
                        borderRadius: '4px', 
                        fontSize: '0.8em',
                        backgroundColor: list.is_completed ? '#28a745' : '#ffc107',
                        color: list.is_completed ? 'white' : 'black'
                      }}>
                        {list.is_completed ? 'Completed' : 'In Progress'}
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '0.9em' }}>
                      <span>Progress</span>
                      <span>{completedItems}/{totalItems} items ({Math.round(progressPercentage)}%)</span>
                    </div>
                    <div style={{ 
                      width: '100%', 
                      height: '6px', 
                      backgroundColor: '#e9ecef', 
                      borderRadius: '3px',
                      overflow: 'hidden'
                    }}>
                      <div style={{ 
                        width: `${progressPercentage}%`, 
                        height: '100%', 
                        backgroundColor: list.is_completed ? '#28a745' : '#007bff',
                        transition: 'width 0.3s ease'
                      }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserLists; 