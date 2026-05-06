import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Share2, Bookmark, ShieldAlert, ShieldCheck, ArrowLeft } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const ArticleView = () => {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const response = await api.get(`/news/${id}`);
        setArticle(response.data);
        if (user) {
          api.post(`/news/${id}/read`).catch(err => console.error('Failed to update read history:', err));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchArticle();
  }, [id, user]);

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading Article...</div>;
  if (!article) return <div style={{ padding: '2rem', textAlign: 'center' }}>Article not found.</div>;

  const { title, content, author, publicationDate, category, detectionResult, viewCount } = article;
  const isReal = detectionResult?.prediction === 'real';

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', animation: 'fadeIn 0.5s ease' }}>
      <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem', color: 'var(--text-secondary)' }}>
        <ArrowLeft size={16} /> Back to Feed
      </Link>
      
      <div className="article-header" style={{ marginBottom: '2rem' }}>
        <span className="article-category">{category || 'General'}</span>
        <h1 style={{ fontSize: '2.5rem', marginTop: '1rem', marginBottom: '1.5rem', lineHeight: 1.2 }}>
          {title}
        </h1>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ color: 'var(--text-secondary)' }}>
            <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{author || 'Anonymous Staff'}</span>
            <span style={{ margin: '0 0.5rem' }}>•</span>
            <span>{new Date(publicationDate).toLocaleDateString()}</span>
            <span style={{ margin: '0 0.5rem' }}>•</span>
            <span>{viewCount} views</span>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button className="btn btn-glass" style={{ padding: '0.5rem 1rem' }}><Bookmark size={18} /> Save</button>
            <button className="btn btn-glass" style={{ padding: '0.5rem 1rem' }}><Share2 size={18} /> Share</button>
          </div>
        </div>
      </div>
      
      <div style={{ marginBottom: '2rem' }}>
        <button 
          className="btn btn-primary" 
          onClick={async () => {
             // Analyzing logic
             try {
                if (!user) { alert('Please log in to run analysis.'); return; }
                const res = await api.post(`/news/${id}/analyze`);
                setArticle(prev => ({ ...prev, detectionResult: res.data }));
             } catch(e) {
                alert('Analysis failed: ' + (e.response?.data?.error || e.message));
             }
          }}
        >
          <ShieldCheck size={18} /> Run ML Fake News Check
        </button>
      </div>

      {detectionResult && (
        <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2.5rem', borderLeft: `4px solid ${isReal ? 'var(--success)' : 'var(--danger)'}`, display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
          <div style={{ 
            backgroundColor: isReal ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)', 
            padding: '1rem', borderRadius: '50%', color: isReal ? 'var(--success)' : 'var(--danger)'
          }}>
            {isReal ? <ShieldCheck size={32} /> : <ShieldAlert size={32} />}
          </div>
          <div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: isReal ? 'var(--success)' : 'var(--danger)' }}>
              {isReal ? 'Verified Authentic' : 'Disputed or Fake Content'}
            </h3>
            <p style={{ color: 'var(--text-secondary)' }}>
              Confidence Score: <strong>{detectionResult.confidence}%</strong> <br/>
              {detectionResult.explanation}
            </p>
          </div>
        </div>
      )}

      <div className="article-body" style={{ fontSize: '1.125rem', lineHeight: 1.8, color: 'var(--text-primary)' }}>
        {content.split('\n').map((paragraph, idx) => (
          <p key={idx} style={{ marginBottom: '1.5rem' }}>{paragraph}</p>
        ))}
      </div>

      {/* Feedback/Report Button */}
      <div style={{ marginTop: '2rem', textAlign: 'center' }}>
        <button
          className="btn btn-danger"
          style={{ padding: '0.5rem 1.5rem', fontWeight: 600 }}
          onClick={async () => {
            if (!user) {
              alert('Please log in to report or give feedback.');
              return;
            }
            const feedback = window.prompt('Please describe why you think this article is fake or provide feedback:');
            if (feedback && feedback.trim().length > 0) {
              try {
                // Explicitly set headers for JSON body
                await api.post(
                  `/news/${id}/report`,
                  { feedback },
                  { headers: { 'Content-Type': 'application/json' } }
                );
                alert('Thank you for your feedback/report!');
              } catch (e) {
                // Show more detailed error info for debugging
                if (e.response) {
                  alert(
                    `Failed to submit feedback: ${e.response.status} ${e.response.statusText}\n${JSON.stringify(e.response.data)}`
                  );
                } else {
                  alert('Failed to submit feedback: ' + e.message);
                }
              }
            }
          }}
        >
          Report as Fake / Give Feedback
        </button>
      </div>
    </div>
  );
};

export default ArticleView;
