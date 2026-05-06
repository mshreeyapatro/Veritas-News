const mongoose = require('mongoose');

const userPreferenceSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  interestedTopics: [{ type: String }],
  readHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: 'NewsArticle' }],
  searchQueries: [{ type: String }]
});

module.exports = mongoose.model('UserPreference', userPreferenceSchema);
