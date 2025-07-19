import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getLists, getUsers } from '../services/api';

const Dashboard = () => {
  const [lists, setLists] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      console.log('Fetching data from backend...');
      
      const [listsData, usersData] = await Promise.all([
        getLists(),
        getUsers()
      ]);
      
      console.log('Lists data:', listsData);
      console.log('Users data:', usersData);
      
      setLists(listsData || []);
      setUsers(usersData || []);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data. Make sure the backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div>
      <h2>Dashboard</h2>
      
      {error && <div className="error">{error}</div>}

      {/* Quick Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <div className="card">
          <h3>Total Lists</h3>
          <p style={{ fontSize: '2em', color: '#007bff' }}>{lists.length}</p>
        </div>
        <div className="card">
          <h3>Total Users</h3>
          <p style={{ fontSize: '2em', color: '#28a745' }}>{users.length}</p>
        </div>
        <div className="card">
          <h3>Completed Lists</h3>
          <p style={{ fontSize: '2em', color: '#6c757d' }}>
            {lists.filter(list => list.is_completed).length}
          </p>
        </div>
      </div>

      {/* Users Section */}
      <div className="card">
        <h3>Users</h3>
        {users.length === 0 ? (
          <p>No users found. Make sure the backend is running.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '15px' }}>
            {users.map(user => (
              <div key={user.id} style={{ padding: '15px', border: '1px solid #ddd', borderRadius: '4px' }}>
                <h4>{user.first_name || 'Unknown'} {user.last_name || 'User'}</h4>
                <p style={{ color: '#666', marginBottom: '10px' }}>@{user.username || 'unknown'}</p>
                <Link 
                  to={`/user/${user.id}/lists`}
                  className="btn btn-secondary"
                  style={{ textDecoration: 'none', display: 'inline-block' }}
                >
                  View Lists
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Lists */}
      <div className="card">
        <h3>All SOP Lists</h3>
        {lists.length === 0 ? (
          <p>No SOP lists found. <Link to="/create">Create your first list</Link></p>
        ) : (
          <div style={{ display: 'grid', gap: '15px' }}>
            {lists.map(list => (
              <div key={list.id} style={{ 
                padding: '15px', 
                border: '1px solid #ddd', 
                borderRadius: '4px',
                backgroundColor: list.is_completed ? '#d4edda' : 'white'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div>
                    <h4>
                      <Link 
                        to={`/list/${list.id}`} 
                        style={{ color: '#007bff', textDecoration: 'none' }}
                      >
                        {list.title}
                      </Link>
                    </h4>
                    {list.description && (
                      <p style={{ color: '#666', margin: '5px 0' }}>{list.description}</p>
                    )}
                    <p style={{ fontSize: '0.9em', color: '#888' }}>
                      Assigned to: <strong>
                        {list.assigned_user ? 
                          `${list.assigned_user.first_name} ${list.assigned_user.last_name}` : 
                          'Unknown User'
                        }
                      </strong>
                    </p>
                    <p style={{ fontSize: '0.9em', color: '#888' }}>
                      Created: {list.created_at ? new Date(list.created_at).toLocaleDateString() : 'Unknown'}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ 
                      padding: '4px 8px', 
                      borderRadius: '4px', 
                      fontSize: '0.8em',
                      backgroundColor: list.is_completed ? '#28a745' : '#ffc107',
                      color: list.is_completed ? 'white' : 'black'
                    }}>
                      {list.is_completed ? 'Completed' : 'In Progress'}
                    </span>
                    <p style={{ fontSize: '0.9em', color: '#666', marginTop: '5px' }}>
                      {list.items ? 
                        `${list.items.filter(item => item.is_checked).length}/${list.items.length} items` :
                        '0/0 items'
                      }
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard; 