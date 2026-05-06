const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authController = require('./controllers/authController');
const newsController = require('./controllers/newsController');
const authMiddleware = require('./middleware/authMiddleware');

const app = express();

app.use(cors());
app.use(express.json());

// Auth routes
app.post('/api/auth/register', authController.register);
app.post('/api/auth/login', authController.login);
app.put('/api/auth/profile', authMiddleware, authController.updateProfile);
app.get('/api/auth/profile', authMiddleware, authController.getProfile);

// News routes
app.get('/api/news/recommendations', authMiddleware, newsController.getRecommendations);
app.get('/api/news', newsController.getAllArticles);
app.get('/api/news/:id', newsController.getArticleById);
app.put('/api/news/:id', authMiddleware, newsController.updateArticle);
app.delete('/api/news/:id', authMiddleware, newsController.deleteArticle);
app.post('/api/news/:id/analyze', authMiddleware, newsController.analyzeArticle);
app.post('/api/news/:id/read', authMiddleware, newsController.markArticleRead);
app.post('/api/news/publish', authMiddleware, newsController.publishArticle);

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/news_platform';

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => console.log(`Backend server running on port ${PORT}`));
  })
  .catch(err => console.error('Error connecting to MongoDB:', err));
