const jwt = require('jsonwebtoken');
const { User } = require('./models');

const protect = async (req, res, next) => {
  const token = req.headers.authorization?.startsWith('Bearer ') && req.headers.authorization.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Sign in to continue.' });
  try { req.user = await User.findById(jwt.verify(token, process.env.JWT_SECRET).id).select('-password'); if (!req.user) throw new Error(); next(); }
  catch { res.status(401).json({ message: 'Your session is invalid or has expired.' }); }
};
const adminOnly = (req, res, next) => req.user?.role === 'admin' ? next() : res.status(403).json({ message: 'Administrator access is required.' });
const makeToken = user => jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
module.exports = { protect, adminOnly, makeToken };
