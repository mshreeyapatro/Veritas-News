const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret123';

exports.register = async (req, res) => {
  try {
    const { username, email, password, fullName, bio } = req.body;
    
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) return res.status(400).json({ error: 'User already exists' });
    
    const passwordHash = await bcrypt.hash(password, 10);
    const result = await User.create({
      username, email, passwordHash,
      profile: { fullName, bio }
    });
    
    res.status(201).json({ message: 'User registered successfully!' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    
    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) return res.status(401).json({ error: 'Invalid credentials' });
    
    const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
    
    res.status(200).json({ token, user: { username: user.username, email: user.email, role: user.role, profile: user.profile } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const UserPreference = require('../models/UserPreference');

exports.updateProfile = async (req, res) => {
  try {
    const { fullName, bio, avatarUrl, interestedTopics } = req.body;
    const userId = req.user.userId;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    user.profile = { ...user.profile.toObject(), fullName, bio, avatarUrl };
    await user.save();

    let pref = await UserPreference.findOne({ userId });
    if (!pref) {
      pref = await UserPreference.create({ userId, interestedTopics: [], readHistory: [], searchQueries: [] });
    }
    
    if (interestedTopics && Array.isArray(interestedTopics)) {
      pref.interestedTopics = interestedTopics;
      await pref.save();
    }
    
    res.json({ message: 'Profile updated', profile: user.profile, interestedTopics: pref.interestedTopics });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId).select('-passwordHash');
    if (!user) return res.status(404).json({ error: 'User not found' });

    let pref = await UserPreference.findOne({ userId });
    
    res.json({
      user: {
        username: user.username,
        email: user.email,
        role: user.role,
        profile: user.profile
      },
      interestedTopics: pref ? pref.interestedTopics : []
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
