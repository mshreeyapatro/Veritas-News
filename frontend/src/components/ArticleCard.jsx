import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ShieldCheck } from 'lucide-react';

const ArticleCard = ({ article }) => {
  const { _id, title, content, category, publicationDate, detectionResult } = article;

  const previewText = content ? (content.substring(0, 100) + '...') : '';
  const date = new Date(publicationDate).toLocaleDateString();

  return (
    <Link to={`/article/${_id}`}>
      <div className="glass-panel article-card">
        <div className="article-category">{category || 'General'}</div>
        <h3 className="article-title">{title}</h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
          {previewText}
        </p>

        <div className="article-meta">
          <span>{date}</span>
          
          {detectionResult && (
            <div 
              className={`cred-badge ${detectionResult.prediction === 'real' ? 'cred-real' : 'cred-fake'}`}
              title={detectionResult.explanation}
            >
              {detectionResult.prediction === 'real' ? <ShieldCheck size={14} /> : <ShieldAlert size={14} />}
              Conf: {detectionResult.confidence}%
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ArticleCard;
