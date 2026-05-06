import React, { useState, useEffect } from 'react';
import ArticleCard from '../components/ArticleCard';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const [articles, setArticles] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(''); // <-- Add search state
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [newsRes, recRes] = await Promise.all([
          api.get('/news'),
          user ? api.get('/news/recommendations') : Promise.resolve({ data: [] })
        ]);
        setArticles(newsRes.data);
        if (user) setRecommendations(recRes.data);
      } catch (err) {
        console.error('Failed to fetch articles', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  // Filter articles based on search query
  const filteredArticles = articles.filter(article => {
    const query = search.trim().toLowerCase();
    return (
      article.title.toLowerCase().includes(query) ||
      (article.content && article.content.toLowerCase().includes(query))
    );
  });

  return (
    <div className="home-page">
      <section className="hero-section">
        <h1 style={{ fontSize: '3rem', fontWeight: 700, marginBottom: '0.5rem' }}>
          Discover the <span className="gradient-text">Truth</span>
        </h1>
        <p className="hero-subtitle">
          Next-generation news reading experience powered by AI fake news detection.
        </p>
      </section>

      {/* Search Bar */}
      <div style={{ margin: '2rem 0', textAlign: 'center' }}>
        <input
          type="text"
          placeholder="Search articles..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            padding: '0.5rem 1rem',
            fontSize: '1rem',
            borderRadius: '4px',
            border: '1px solid #ccc',
            width: '100%',
            maxWidth: '400px'
          }}
        />
      </div>

      {user && recommendations.length > 0 && (
        <section style={{ marginBottom: '4rem' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
            Recommended For You
          </h2>
          <div className="articles-grid">
            {recommendations.map(article => (
              <ArticleCard key={article._id} article={article} />
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
          Latest verified stories
        </h2>
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem' }}>Loading data...</div>
        ) : (
          <div className="articles-grid">
            {filteredArticles.length > 0 ? (
              filteredArticles.map(article => (
                <ArticleCard key={article._id} article={article} />
              ))
            ) : (
              <p>No articles found. Please add mock data or publish one via API!</p>
            )}
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
