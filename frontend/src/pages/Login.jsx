import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await api.post('/auth/login', { email, password });
      login(response.data.user, response.data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    }
  };

  return (
    <div className="auth-container" style={{ maxWidth: '400px', margin: '4rem auto', animation: 'fadeIn 0.5s ease' }}>
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem', textAlign: 'center' }}>Welcome Back</h2>
        {error && <div style={{ color: 'var(--danger)', marginBottom: '1rem', padding: '0.75rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: '0.5rem' }}>{error}</div>}
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ width: '100%', color: 'white', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border)', background: 'var(--surface)' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ width: '100%', color: 'white', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border)', background: 'var(--surface)' }}
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem', padding: '0.75rem', fontSize: '1.1rem' }}>Login</button>
        </form>
        <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-secondary)' }}>
          Don't have an account? <Link to="/register" style={{ color: 'var(--primary)' }}>Sign up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
