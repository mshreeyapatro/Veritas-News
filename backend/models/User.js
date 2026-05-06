const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  fullName: { type: String },
  bio: { type: String },
  avatarUrl: { type: String }
});

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['user', 'author', 'admin'], default: 'user' },
  profile: profileSchema,
  registrationDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
