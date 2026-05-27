const Expense = require('../models/Expense');

// ─── @desc    Create a new expense
// ─── @route   POST /api/expenses
// ─── @access  Private
const createExpense = async (req, res) => {
  try {
    const { title, amount, category, date, notes } = req.body;

    // Validate required fields
    if (!title || !amount || !category) {
      return res.status(400).json({ message: 'Title, amount and category are required' });
    }

    const expense = await Expense.create({
      user: req.user._id,   // ← comes from auth middleware
      title,
      amount,
      category,
      date: date || Date.now(),
      notes,
    });

    res.status(201).json(expense);

  } catch (error) {
    console.error('Create expense error:', error);
    res.status(500).json({ message: 'Server error while creating expense' });
  }
};

// ─── @desc    Get all expenses for logged-in user
// ─── @route   GET /api/expenses
// ─── @access  Private
const getExpenses = async (req, res) => {
  try {
    // Extract query parameters for filtering/searching
    const { category, search, startDate, endDate } = req.query;

    // Start building the filter object
    // Always filter by the logged-in user first
    let filter = { user: req.user._id };

    // If category filter is provided (and not 'All')
    if (category && category !== 'All') {
      filter.category = category;
    }

    // If search term is provided
    // $regex lets us do partial matching, $options: 'i' = case-insensitive
    if (search) {
      filter.title = { $regex: search, $options: 'i' };
    }

    // Date range filter
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate); // greater than or equal
      if (endDate) filter.date.$lte = new Date(endDate);     // less than or equal
    }

    const expenses = await Expense.find(filter).sort({ date: -1 }); // newest first

    res.status(200).json(expenses);

  } catch (error) {
    console.error('Get expenses error:', error);
    res.status(500).json({ message: 'Server error while fetching expenses' });
  }
};

// ─── @desc    Get a single expense by ID
// ─── @route   GET /api/expenses/:id
// ─── @access  Private
const getExpenseById = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    // Check that this expense belongs to the logged-in user
    // .toString() because one is ObjectId and one might be a string
    if (expense.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to access this expense' });
    }

    res.status(200).json(expense);

  } catch (error) {
    console.error('Get expense error:', error);
    res.status(500).json({ message: 'Server error while fetching expense' });
  }
};

// ─── @desc    Update an expense
// ─── @route   PUT /api/expenses/:id
// ─── @access  Private
const updateExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    // Ownership check — can't edit someone else's expense
    if (expense.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this expense' });
    }

    // Update only the fields that were sent
    // If a field wasn't sent, keep the existing value
    expense.title    = req.body.title    ?? expense.title;
    expense.amount   = req.body.amount   ?? expense.amount;
    expense.category = req.body.category ?? expense.category;
    expense.date     = req.body.date     ?? expense.date;
    expense.notes    = req.body.notes    ?? expense.notes;

    const updatedExpense = await expense.save();

    res.status(200).json(updatedExpense);

  } catch (error) {
    console.error('Update expense error:', error);
    res.status(500).json({ message: 'Server error while updating expense' });
  }
};

// ─── @desc    Delete an expense
// ─── @route   DELETE /api/expenses/:id
// ─── @access  Private
const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    // Ownership check
    if (expense.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this expense' });
    }

    await expense.deleteOne();

    res.status(200).json({ message: 'Expense deleted successfully', id: req.params.id });

  } catch (error) {
    console.error('Delete expense error:', error);
    res.status(500).json({ message: 'Server error while deleting expense' });
  }
};

// ─── @desc    Get expense summary for analytics
// ─── @route   GET /api/expenses/analytics
// ─── @access  Private
const getAnalytics = async (req, res) => {
  try {
    // MongoDB Aggregation Pipeline — powerful way to compute summaries
    const categoryTotals = await Expense.aggregate([
      // Stage 1: Only look at this user's expenses
      { $match: { user: req.user._id } },

      // Stage 2: Group by category and sum amounts
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },

      // Stage 3: Sort by total descending
      { $sort: { total: -1 } },
    ]);

    // Monthly totals for the current year
    const currentYear = new Date().getFullYear();

    const monthlyTotals = await Expense.aggregate([
      {
        $match: {
          user: req.user._id,
          date: {
            $gte: new Date(`${currentYear}-01-01`),
            $lte: new Date(`${currentYear}-12-31`),
          },
        },
      },
      {
        $group: {
          _id: { $month: '$date' }, // group by month number (1-12)
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } }, // sort by month
    ]);

    // Total spent overall
    const totalResult = await Expense.aggregate([
      { $match: { user: req.user._id } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    const totalSpent = totalResult[0]?.total || 0;

    res.status(200).json({
      categoryTotals,
      monthlyTotals,
      totalSpent,
    });

  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ message: 'Server error while fetching analytics' });
  }
};

module.exports = {
  createExpense,
  getExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
  getAnalytics,
};