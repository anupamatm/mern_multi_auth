const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const ACCESS_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET;
const ACCESS_EXPIRES = process.env.ACCESS_EXPIRES || '15m';
const REFRESH_EXPIRES = process.env.REFRESH_EXPIRES || '7d';

// Create short-lived access token
function createAccessToken(user) {
  return jwt.sign(
    { userId: user._id.toString(), role: user.role },
    ACCESS_SECRET,
    { expiresIn: ACCESS_EXPIRES }
  );
}

// Create refresh token (contains tokenVersion and jti)
function createRefreshToken(user) {
  return jwt.sign(
    {
      userId: user._id.toString(),
      tokenVersion: user.tokenVersion || 0,
      jti: uuidv4()
    },
    REFRESH_SECRET,
    { expiresIn: REFRESH_EXPIRES }
  );
}

function verifyAccessToken(token) {
  return jwt.verify(token, ACCESS_SECRET);
}

function verifyRefreshToken(token) {
  return jwt.verify(token, REFRESH_SECRET);
}

module.exports = {
  createAccessToken,
  createRefreshToken,
  verifyAccessToken,
  verifyRefreshToken
};
