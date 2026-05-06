import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import ArticleCard from '../components/ArticleCard'; // Add this import

const AVAILABLE_TOPICS = ["General", "Technology", "Politics", "Business", "Health", "Science", "Entertainment", "Sports"];

const Profile = () => {
  const { user, login } = useAuth(); // we'll use login function to update the standard context user state if needed
  const [formData, setFormData] = useState({
    fullName: '',
    bio: '',
    interestedTopics: []
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [recommended, setRecommended] = useState([]);
  const [recLoading, setRecLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/auth/profile');
        const data = response.data;
        setFormData({
          fullName: data.user.profile?.fullName || '',
          bio: data.user.profile?.bio || '',
          interestedTopics: data.interestedTopics || []
        });
      } catch (err) {
        console.error('Failed to load profile', err);
        setMessage({ type: 'danger', text: 'Error loading profile' });
      } finally {
        setLoading(false);
      }
    };
    if (user) {
      fetchProfile();
    }
  }, [user]);

  // Fetch recommendations when interestedTopics change and user is logged in
  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!user || formData.interestedTopics.length === 0) {
        setRecommended([]);
        return;
      }
      setRecLoading(true);
      try {
        // You may need to adjust the endpoint and payload as per your backend
        const res = await api.post('/news/recommend-by-topics', { topics: formData.interestedTopics });
        setRecommended(res.data.articles || []);
      } catch (err) {
        setRecommended([]);
      } finally {
        setRecLoading(false);
      }
    };
    fetchRecommendations();
    // eslint-disable-next-line
  }, [formData.interestedTopics, user]);

  if (!user) return <div style={{ textAlign: 'center', marginTop: '4rem' }}>Please log in to view profile.</div>;
  if (loading) return <div style={{ textAlign: 'center', marginTop: '4rem' }}>Loading profile...</div>;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleTopicToggle = (topic) => {
    setFormData(prev => {
      const isSelected = prev.interestedTopics.includes(topic);
      if (isSelected) {
        return { ...prev, interestedTopics: prev.interestedTopics.filter(t => t !== topic) };
      } else {
        return { ...prev, interestedTopics: [...prev.interestedTopics, topic] };
      }
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });
    
    try {
      const response = await api.put('/auth/profile', formData);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      
      // Update local storage/context with new profile
      if (response.data.profile) {
         login({ ...user, profile: response.data.profile }, localStorage.getItem('token'));
      }
    } catch (err) {
      setMessage({ type: 'danger', text: err.response?.data?.error || 'Failed to update profile.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '2rem auto', animation: 'fadeIn 0.5s ease' }}>
      <h2 style={{ fontSize: '2.5rem', marginBottom: '1.5rem' }}>Your Profile</h2>
      {message.text && (
        <div style={{ 
          color: message.type === 'success' ? 'var(--success)' : 'var(--danger)', 
          marginBottom: '1rem', padding: '1rem', 
          backgroundColor: message.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', 
          borderRadius: '0.5rem' 
        }}>
          {message.text}
        </div>
      )}
      
      <form onSubmit={handleSave} className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Username</label>
          <input 
            type="text" value={user.username} disabled 
            style={{ width: '100%', padding: '1rem',color: 'var(--text-primary)', borderRadius: '0.5rem', border: '1px solid var(--border)', background: 'rgba(0,0,0,0.2)', color: 'var(--text-secondary)' }} 
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Full Name</label>
          <input 
            type="text" name="fullName" value={formData.fullName} onChange={handleChange} 
            style={{ width: '100%', padding: '1rem', color: 'var(--text-primary)', borderRadius: '0.5rem', border: '1px solid var(--border)', background: 'var(--surface)' }} 
            placeholder="Enter your full name"
          />
        </div>

        <div>
           <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Bio</label>
           <textarea 
             name="bio" value={formData.bio} onChange={handleChange} 
             style={{ width: '100%', padding: '1rem',color: 'var(--text-primary)', borderRadius: '0.5rem', border: '1px solid var(--border)', background: 'var(--surface)', minHeight: '100px', fontFamily: 'inherit' }}
             placeholder="Tell us about yourself..."
           />
        </div>

        <div>
           <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: 500 }}>Interested Topics <span style={{fontSize: '0.875rem', color: 'var(--text-secondary)'}}>(helps us recommend articles)</span></label>
           <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
             {AVAILABLE_TOPICS.map(topic => (
               <button 
                 type="button" 
                 key={topic} 
                 onClick={() => handleTopicToggle(topic)}
                 style={{
                   padding: '0.5rem 1rem', 
                   borderRadius: '2rem', 
                   background: formData.interestedTopics.includes(topic) ? 'var(--primary)' : 'var(--surface)',
                   color: formData.interestedTopics.includes(topic) ? '#fff' : 'var(--text-primary)',
                   border: `1px solid ${formData.interestedTopics.includes(topic) ? 'var(--primary)' : 'var(--border)'}`,
                   cursor: 'pointer',
                   transition: 'all 0.2s ease'
                 }}
               >
                 {topic}
               </button>
             ))}
           </div>
        </div>

        <button type="submit" className="btn btn-primary" disabled={saving} style={{ alignSelf: 'flex-start', padding: '0.75rem 2rem', fontSize: '1.1rem', marginTop: '1rem' }}>
          {saving ? 'Saving...' : 'Save Profile'}
        </button>
      </form>

      {/* Recommended Articles Section */}
      {formData.interestedTopics.length > 0 && (
        <div style={{ margin: '3rem 0' }}>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Recommended Articles for You</h3>
          {recLoading ? (
            <div>Loading recommendations...</div>
          ) : recommended.length > 0 ? (
            <div className="articles-grid">
              {recommended.map(article => (
                <ArticleCard key={article._id} article={article} />
              ))}
            </div>
          ) : (
            <div>No recommendations found for your selected topics.</div>
          )}
        </div>
      )}
    </div>
  );
};

export default Profile;
