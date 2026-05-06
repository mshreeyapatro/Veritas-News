import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    fullName: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await api.post('/auth/register', formData);
      setSuccess('Registration successful! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed.');
    }
  };

  return (
    <div className="auth-container" style={{ maxWidth: '400px', margin: '3rem auto', animation: 'fadeIn 0.5s ease' }}>
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem', textAlign: 'center' }}>Create Account</h2>
        {error && <div style={{ color: 'var(--danger)', marginBottom: '1rem', padding: '0.75rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: '0.5rem' }}>{error}</div>}
        {success && <div style={{ color: 'var(--success)', marginBottom: '1rem', padding: '0.75rem', backgroundColor: 'rgba(16, 185, 129, 0.1)', borderRadius: '0.5rem' }}>{success}</div>}
        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Username</label>
            <input type="text" name="username" value={formData.username} onChange={handleChange} required style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border)', background: 'var(--surface)' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Full Name</label>
            <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border)', background: 'var(--surface)' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} required style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border)', background: 'var(--surface)' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Password</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} required style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border)', background: 'var(--surface)' }} />
          </div>
          <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem', padding: '0.75rem', fontSize: '1.1rem' }}>Sign Up</button>
        </form>
        <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-secondary)' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--primary)' }}>Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
