import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar glass-panel">
      <Link to="/" className="nav-brand">
        <ShieldCheck color="#3b82f6" size={32} />
        <span className="gradient-text">Veritas News</span>
      </Link>
      <div className="nav-links">
        <Link to="/">Feed</Link>
        {user ? (
          <>
            {(user.role === 'admin' || user.role === 'author') && (
              <>
                <Link to="/publish">Publish</Link>
                <Link to="/dashboard">Dashboard</Link>
              </>
            )}
            <Link to="/profile" style={{ color: 'var(--text-secondary)', marginLeft: '1rem', textDecoration: 'none' }}>Hi, {user.username}</Link>
            <button className="btn btn-glass" onClick={handleLogout} style={{ marginLeft: '1rem' }}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn btn-primary" style={{ textDecoration: 'none' }}>Sign In</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
