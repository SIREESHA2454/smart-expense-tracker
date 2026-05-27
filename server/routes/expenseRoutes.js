const express = require('express');
const router = express.Router();
const {
  createExpense,
  getExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
  getAnalytics,
} = require('../controllers/expenseController');
const { protect } = require('../middleware/authMiddleware');

// Apply protect middleware to ALL routes in this file
// Every single expense route requires authentication
router.use(protect);

// Analytics route MUST come before /:id routes
// Otherwise Express thinks "analytics" is an :id parameter
router.get('/analytics', getAnalytics);

router.route('/')
  .get(getExpenses)
  .post(createExpense);

router.route('/:id')
  .get(getExpenseById)
  .put(updateExpense)
  .delete(deleteExpense);

module.exports = router;