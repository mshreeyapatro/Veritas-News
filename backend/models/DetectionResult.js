const mongoose = require('mongoose');

const detectionResultSchema = new mongoose.Schema({
  articleId: { type: mongoose.Schema.Types.ObjectId, ref: 'NewsArticle' },
  prediction: { type: String, enum: ['fake', 'real'] },
  score: { type: Number },
  confidence: { type: Number },
  explanation: { type: String }
});

module.exports = mongoose.model('DetectionResult', detectionResultSchema);
