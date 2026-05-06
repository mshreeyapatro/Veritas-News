const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret123';

module.exports = (req, res, next) => {
  try {
    const header = req.header('Authorization');
    if (!header) return res.status(401).json({ error: 'Access denied: No token provided' });
    
    const token = header.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Contains userId
    next();
  } catch (error) {
    res.status(400).json({ error: 'Invalid token' });
  }
};
