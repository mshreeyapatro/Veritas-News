const mongoose = require('mongoose');

const newsArticleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  author: { type: String },
  publicationDate: { type: Date, default: Date.now },
  sourceUrl: { type: String },
  category: { type: String },
  viewCount: { type: Number, default: 0 },
});

module.exports = mongoose.model('NewsArticle', newsArticleSchema);
