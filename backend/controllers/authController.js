const User = require('../models/User');
const { hashPassword, comparePassword } = require('../utils/hash');
const tokenService = require('../services/tokenService');

// Register a new user
async function register(req, res) {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'Missing fields' });

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already registered' });

    const hashed = await hashPassword(password);
    const user = await User.create({ name, email, password: hashed, role });

    const accessToken = tokenService.createAccessToken(user);
    const refreshToken = tokenService.createRefreshToken(user);

    res.cookie('jid', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/api/auth/refresh_token'
    });

    return res.json({
      accessToken,
      user: { id: user._id, email: user.email, role: user.role, name: user.name }
    });
  } catch (err) {
    console.error('register error', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

// Login existing user
async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Missing fields' });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const valid = await comparePassword(password, user.password);
    if (!valid) return res.status(400).json({ message: 'Invalid credentials' });

    const accessToken = tokenService.createAccessToken(user);
    const refreshToken = tokenService.createRefreshToken(user);

    res.cookie('jid', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/api/auth/refresh_token'
    });

    return res.json({
      accessToken,
      user: { id: user._id, email: user.email, role: user.role, name: user.name }
    });
  } catch (err) {
    console.error('login error', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

// Refresh token endpoint (rotation: issue new refresh token each time)
async function refreshToken(req, res) {
  try {
    const token = req.cookies.jid;
    if (!token) return res.status(401).json({ ok: false, message: 'No refresh token' });

    let payload;
    try {
      payload = tokenService.verifyRefreshToken(token);
    } catch (err) {
      return res.status(401).json({ ok: false, message: 'Invalid refresh token' });
    }

    const user = await User.findById(payload.userId);
    if (!user) return res.status(401).json({ ok: false, message: 'User not found' });

    // Check tokenVersion
    if (payload.tokenVersion !== user.tokenVersion) {
      return res.status(401).json({ ok: false, message: 'Refresh token revoked' });
    }

    // Issue new tokens (rotated refresh token)
    const accessToken = tokenService.createAccessToken(user);
    const refreshToken = tokenService.createRefreshToken(user);

    res.cookie('jid', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/api/auth/refresh_token'
    });

    return res.json({
      ok: true,
      accessToken,
      user: { id: user._id, email: user.email, role: user.role, name: user.name }
    });
  } catch (err) {
    console.error('refreshToken error', err);
    return res.status(500).json({ ok: false, message: 'Server error' });
  }
}

// Logout: increment tokenVersion to invalidate refresh tokens
async function logout(req, res) {
  try {
    const token = req.cookies.jid;
    if (!token) {
      res.clearCookie('jid', { path: '/api/auth/refresh_token' });
      return res.json({ ok: true });
    }

    let payload;
    try {
      payload = tokenService.verifyRefreshToken(token);
    } catch (err) {
      res.clearCookie('jid', { path: '/api/auth/refresh_token' });
      return res.json({ ok: true });
    }

    await User.findByIdAndUpdate(payload.userId, { $inc: { tokenVersion: 1 } });

    res.clearCookie('jid', { path: '/api/auth/refresh_token' });
    return res.json({ ok: true });
  } catch (err) {
    console.error('logout error', err);
    return res.status(500).json({ ok: false, message: 'Server error' });
  }
}

module.exports = { register, login, refreshToken, logout };
