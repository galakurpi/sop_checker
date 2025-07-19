import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import CreateList from './components/CreateList';
import ListDetail from './components/ListDetail';
import UserLists from './components/UserLists';

function App() {
  return (
    <Router>
      <div className="App">
        {/* Navigation Bar */}
        <nav className="navbar">
          <div className="container">
            <h1>SOP Checker</h1>
            <nav>
              <Link to="/">Dashboard</Link>
              <Link to="/create">Create List</Link>
            </nav>
          </div>
        </nav>

        {/* Main Content */}
        <div className="container">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/create" element={<CreateList />} />
            <Route path="/list/:id" element={<ListDetail />} />
            <Route path="/user/:userId/lists" element={<UserLists />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App; 