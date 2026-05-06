import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Edit2, Trash2, ShieldAlert, ShieldCheck } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Basic redirect if not authorized
    if (user && user.role !== 'admin' && user.role !== 'author') {
      navigate('/');
    }
  }, [user, navigate]);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await api.get('/news');
        // If author, filter locally for now (could be optimized with a backend route)
        if (user.role === 'author') {
           setArticles(response.data.filter(a => a.author === user.username));
        } else {
           setArticles(response.data);
        }
      } catch (err) {
        console.error('Failed to load articles for dashboard', err);
      } finally {
        setLoading(false);
      }
    };
    if (user && (user.role === 'author' || user.role === 'admin')) {
      fetchArticles();
    }
  }, [user]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this article?')) return;
    try {
      await api.delete(`/news/${id}`);
      setArticles(articles.filter(a => a._id !== id));
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete');
    }
  };

  if (loading) return <div style={{ textAlign: 'center', marginTop: '4rem' }}>Loading Dashboard...</div>;

  return (
    <div style={{ maxWidth: '1000px', margin: '2rem auto', animation: 'fadeIn 0.5s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '2.5rem' }}>{user.role === 'admin' ? 'Admin Dashboard' : 'Author Dashboard'}</h2>
        <Link to="/publish" className="btn btn-primary" style={{ textDecoration: 'none' }}>Publish New</Link>
      </div>
      
      <div className="glass-panel" style={{ overflowX: 'auto', padding: '1rem' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '1rem' }}>Title</th>
              <th style={{ padding: '1rem' }}>Category</th>
              {user.role === 'admin' && <th style={{ padding: '1rem' }}>Author</th>}
              <th style={{ padding: '1rem' }}>Views</th>
              <th style={{ padding: '1rem' }}>Verified Status</th>
              <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {articles.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No articles found.</td>
              </tr>
            ) : (
              articles.map(article => {
                const isReal = article.detectionResult?.prediction === 'real';
                return (
                  <tr key={article._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s' }} className="table-row-hover">
                    <td style={{ padding: '1rem', maxWidth: '250px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      <Link to={`/article/${article._id}`} style={{ color: 'var(--text-primary)', textDecoration: 'none' }}>
                        {article.title}
                      </Link>
                    </td>
                    <td style={{ padding: '1rem' }}>{article.category || 'General'}</td>
                    {user.role === 'admin' && <td style={{ padding: '1rem' }}>{article.author}</td>}
                    <td style={{ padding: '1rem' }}>{article.viewCount}</td>
                    <td style={{ padding: '1rem' }}>
                       {article.detectionResult ? (
                         <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: isReal ? 'var(--success)' : 'var(--danger)' }}>
                           {isReal ? <ShieldCheck size={16} /> : <ShieldAlert size={16} />}
                           <span style={{ fontSize: '0.875rem' }}>{article.detectionResult.confidence}%</span>
                         </div>
                       ) : <span style={{ color: 'var(--text-secondary)' }}>Unverified</span>}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <button onClick={() => alert('Edit feature coming soon via PUT /api/news/:id')} style={{ background: 'transparent', border: 'none', color: '#3b82f6', cursor: 'pointer', marginRight: '1rem' }}>
                        <Edit2 size={18} />
                      </button>
                      <button onClick={() => handleDelete(article._id)} style={{ background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}>
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;
