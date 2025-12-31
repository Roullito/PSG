import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import './App.css';

import Dashboard from './pages/Dashboard';
import Players from './pages/Players';
import Matches from './pages/Matches';
import MatchDetail from './pages/MatchDetail';

function Navigation() {
  const location = useLocation();

  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <nav className="nav">
      <div className="nav-content">
        <Link to="/" className="nav-brand">
          ⚽ Veo Analytics
        </Link>
        <ul className="nav-links">
          <li>
            <Link to="/" className={`nav-link ${isActive('/')}`}>
              Dashboard
            </Link>
          </li>
          <li>
            <Link to="/players" className={`nav-link ${isActive('/players')}`}>
              Joueurs
            </Link>
          </li>
          <li>
            <Link to="/matches" className={`nav-link ${isActive('/matches')}`}>
              Matchs
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}

function App() {
  return (
    <Router>
      <Navigation />
      <div className="container">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/players" element={<Players />} />
          <Route path="/matches" element={<Matches />} />
          <Route path="/matches/:id" element={<MatchDetail />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
