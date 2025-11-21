const express = require('express');
const router = express.Router();
const { authenticateAccess, authorizeRoles } = require('../middleware/authMiddleware');

// any authenticated user
router.get('/me', authenticateAccess, (req, res) => {
  return res.json({ message: 'You are authenticated', user: req.user });
});

// role-based
router.get('/admin', authenticateAccess, authorizeRoles('admin'), (req, res) => {
  return res.json({ message: 'Admin data' });
});
router.get('/seller', authenticateAccess, authorizeRoles('seller'), (req, res) => {
  return res.json({ message: 'Seller data' });
});
router.get('/customer', authenticateAccess, authorizeRoles('customer'), (req, res) => {
  return res.json({ message: 'Customer data' });
});

module.exports = router;
