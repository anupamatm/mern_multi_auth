const tokenService = require('../services/tokenService');

async function authenticateAccess(req, res, next) {
  try {
    const header = req.headers['authorization'];
    if (!header) return res.status(401).json({ message: 'No authorization header' });

    const parts = header.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer')
      return res.status(401).json({ message: 'Invalid authorization format' });

    const token = parts[1];
    const payload = tokenService.verifyAccessToken(token);
    req.user = { id: payload.userId, role: payload.role };
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired access token' });
  }
}

function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: 'Not authenticated' });
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden: insufficient role' });
    }
    next();
  };
}

module.exports = { authenticateAccess, authorizeRoles };
