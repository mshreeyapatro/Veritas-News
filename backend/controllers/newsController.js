const NewsArticle = require('../models/NewsArticle');

const ML_API_URL = 'http://127.0.0.1:8000/api/analyze';

exports.getAllArticles = async (req, res) => {
  try {
    const articles = await NewsArticle.find().sort({ publicationDate: -1 });
    res.json(articles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getArticleById = async (req, res) => {
  try {
    const article = await NewsArticle.findById(req.params.id);
    if (!article) return res.status(404).json({ error: 'Not found' });
    
    // Simulate reading it increases views
    article.viewCount += 1;
    await article.save();
    
    res.json(article);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.publishArticle = async (req, res) => {
  try {
    if (req.user.role !== 'author' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied: Requires author or admin role' });
    }
    
    const { title, content, author, sourceUrl, category } = req.body;
    
    // Evaluate via ML microservice upon publish
    let detectionResult = null;
    try {
      const mlResponse = await fetch(ML_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articleId: "temp", title, content })
      });
      if (mlResponse.ok) {
        const mlData = await mlResponse.json();
        detectionResult = {
          prediction: mlData.prediction,
          score: mlData.score,
          confidence: mlData.confidence,
          explanation: mlData.explanation
        };
      }
    } catch (mlErr) {
      console.log('Error hitting ML service: ', mlErr.message);
    }

    const newArticle = await NewsArticle.create({
      title, content, author, sourceUrl, category, detectionResult
    });
    
    res.status(201).json(newArticle);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateArticle = async (req, res) => {
  try {
    if (req.user.role !== 'author' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const { title, content, category } = req.body;
    const article = await NewsArticle.findById(req.params.id);
    
    if (!article) return res.status(404).json({ error: 'Article not found' });
    if (req.user.role === 'author' && article.author !== req.user.username) {
      return res.status(403).json({ error: 'You can only edit your own articles' });
    }

    article.title = title || article.title;
    article.content = content || article.content;
    article.category = category || article.category;
    await article.save();
    
    res.json(article);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteArticle = async (req, res) => {
  try {
    if (req.user.role !== 'author' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const article = await NewsArticle.findById(req.params.id);
    if (!article) return res.status(404).json({ error: 'Article not found' });
    if (req.user.role === 'author' && article.author !== req.user.username) {
      return res.status(403).json({ error: 'You can only delete your own articles' });
    }

    await NewsArticle.findByIdAndDelete(req.params.id);
    res.json({ message: 'Article deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const UserPreference = require('../models/UserPreference');

exports.markArticleRead = async (req, res) => {
  try {
    const userId = req.user.userId;
    const articleId = req.params.id;
    
    let pref = await UserPreference.findOne({ userId });
    if (!pref) {
      pref = await UserPreference.create({ userId, interestedTopics: [], readHistory: [], searchQueries: [] });
    }
    
    if (!pref.readHistory.includes(articleId)) {
      pref.readHistory.push(articleId);
      await pref.save();
    }
    
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getRecommendations = async (req, res) => {
  try {
    const userId = req.user.userId;
    let pref = await UserPreference.findOne({ userId }).populate('readHistory');
    
    if (!pref || pref.readHistory.length === 0) {
      // Fallback to latest articles
      const fallback = await NewsArticle.find().sort({ publicationDate: -1 }).limit(5);
      return res.json(fallback);
    }
    
    // Prepare history data for ML service
    const historyData = pref.readHistory.map(a => ({
      articleId: a._id,
      title: a.title,
      category: a.category,
      content: a.content
    }));
    
    // Get candidate articles (not in read history)
    const candidates = await NewsArticle.find({ _id: { $nin: pref.readHistory } }).sort({ publicationDate: -1 }).limit(50);
    const candidateData = candidates.map(a => ({
      articleId: a._id,
      title: a.title,
      category: a.category,
      content: a.content
    }));
    
    // Call ML service
    let recommendedIds = [];
    try {
      const resp = await fetch('http://127.0.0.1:8000/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
           userId, 
           interestedTopics: pref.interestedTopics || [],
           history: historyData, 
           candidates: candidateData 
        })
      });
      if (resp.ok) {
        const mlData = await resp.json();
        recommendedIds = mlData.recommendedIds || [];
      }
    } catch(err) {
      console.log('Error hitting ML recommendation:', err.message);
    }
    
    let recommendations = [];
    if (recommendedIds.length > 0) {
      recommendations = await NewsArticle.find({ _id: { $in: recommendedIds } });
    } else {
      recommendations = await NewsArticle.find().sort({ publicationDate: -1 }).limit(5);
    }
    
    res.json(recommendations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.analyzeArticle = async (req, res) => {
  try {
    const article = await NewsArticle.findById(req.params.id);
    if (!article) return res.status(404).json({ error: 'Article not found' });

    let detectionResult = null;
    try {
      const mlResponse = await fetch(ML_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articleId: "temp", title: article.title, content: article.content })
      });
      if (mlResponse.ok) {
        const mlData = await mlResponse.json();
        detectionResult = {
          prediction: mlData.prediction,
          score: mlData.score,
          confidence: mlData.confidence,
          explanation: mlData.explanation
        };
      } else {
        return res.status(500).json({ error: 'ML service error' });
      }
    } catch (mlErr) {
      console.log('Error hitting ML service: ', mlErr.message);
      return res.status(503).json({ error: 'ML service unavailable' });
    }

    article.detectionResult = detectionResult;
    await article.save();

    res.json(detectionResult);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
