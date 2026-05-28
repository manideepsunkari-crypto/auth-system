const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Helper: generate access + refresh token pair
const generateTokens = (userId, role) => {
  const accessToken = jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || '15m' }
  );

  const refreshToken = jwt.sign(
    { id: userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY || '7d' }
  );

  return { accessToken, refreshToken };
};

// POST /api/auth/signup
const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already in use' });
    }

    // Create user — password hashing happens in the model's pre-save hook
    const user = await User.create({ name, email, password });

    const { accessToken, refreshToken } = generateTokens(user._id, user.role);

    // Save refresh token to DB so we can invalidate it on logout
    user.refreshToken = refreshToken;
    await user.save();

    res.status(201).json({
      message: 'Account created successfully',
      accessToken,
      refreshToken,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const { accessToken, refreshToken } = generateTokens(user._id, user.role);

    // Rotate refresh token on every login
    user.refreshToken = refreshToken;
    await user.save();

    res.json({
      message: 'Login successful',
      accessToken,
      refreshToken,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// POST /api/auth/refresh
const refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token required' });
    }

    // Verify the token signature
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    // Check it matches what we stored — prevents reuse of old tokens
    const user = await User.findById(decoded.id);
    if (!user || user.refreshToken !== refreshToken) {
      return res.status(403).json({ message: 'Invalid refresh token' });
    }

    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user._id, user.role);

    // Rotate: store the new refresh token
    user.refreshToken = newRefreshToken;
    await user.save();

    res.json({ accessToken, refreshToken: newRefreshToken });
  } catch (err) {
    res.status(403).json({ message: 'Invalid or expired refresh token' });
  }
};

// POST /api/auth/logout
const logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.sendStatus(204);

    // Invalidate the refresh token server-side
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    await User.findByIdAndUpdate(decoded.id, { refreshToken: null });

    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    res.sendStatus(204); // Even if token is invalid, logout succeeds
  }
};

module.exports = { signup, login, refresh, logout };
