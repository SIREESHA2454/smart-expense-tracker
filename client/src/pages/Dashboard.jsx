import { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import ExpenseList from '../components/ExpenseList';
import ExpenseForm from '../components/ExpenseForm';
import api from '../api/axios';

const CATEGORIES = ['All', 'Food', 'Transport', 'Entertainment', 'Health', 'Shopping', 'Utilities', 'Other'];

const Dashboard = () => {
  const [expenses, setExpenses]           = useState([]);
  const [loading, setLoading]             = useState(true);
  const [showForm, setShowForm]           = useState(false);
  const [expenseToEdit, setExpenseToEdit] = useState(null);
  const [search, setSearch]               = useState('');
  const [category, setCategory]           = useState('All');
  const [summary, setSummary]             = useState({
    total: 0, thisMonth: 0, topCategory: '—'
  });

  // useCallback memoizes the function so it doesn't re-create on every render
  // This is important because fetchExpenses is a dependency of useEffect
  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    try {
      // Build query string from current filters
      const params = new URLSearchParams();
      if (search)             params.append('search', search);
      if (category !== 'All') params.append('category', category);

      const { data } = await api.get(`/expenses?${params.toString()}`);
      setExpenses(data);

      // Compute summary from fetched data
      computeSummary(data);
    } catch (err) {
      console.error('Failed to fetch expenses:', err);
    } finally {
      setLoading(false);
    }
  }, [search, category]); // re-run whenever search or category changes

  // Re-fetch whenever filters change
  useEffect(() => {
    // Debounce search — wait 400ms after user stops typing before fetching
    const timer = setTimeout(() => {
      fetchExpenses();
    }, search ? 400 : 0); // no delay for category change, delay for search

    return () => clearTimeout(timer); // cleanup on next render
  }, [fetchExpenses]);

  const computeSummary = (data) => {
    const total = data.reduce((sum, e) => sum + e.amount, 0);

    // Filter for current month
    const now = new Date();
    const thisMonthTotal = data
      .filter(e => {
        const d = new Date(e.date);
        return d.getMonth() === now.getMonth() &&
               d.getFullYear() === now.getFullYear();
      })
      .reduce((sum, e) => sum + e.amount, 0);

    // Find top spending category
    const catTotals = data.reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount;
      return acc;
    }, {});
    const topCategory = Object.entries(catTotals)
      .sort((a, b) => b[1] - a[1])[0]?.[0] || '—';

    setSummary({ total, thisMonth: thisMonthTotal, topCategory });
  };

  // Called by ExpenseForm after save
  const handleSave = (savedExpense, isEditing) => {
    if (isEditing) {
      // Replace the old expense in the list
      setExpenses(prev =>
        prev.map(e => e._id === savedExpense._id ? savedExpense : e)
      );
    } else {
      // Prepend new expense to top of list
      setExpenses(prev => [savedExpense, ...prev]);
    }
    // Recompute summary with updated list
    computeSummary(
      isEditing
        ? expenses.map(e => e._id === savedExpense._id ? savedExpense : e)
        : [savedExpense, ...expenses]
    );
  };

  const handleEdit = (expense) => {
    setExpenseToEdit(expense);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/expenses/${id}`);
      const updated = expenses.filter(e => e._id !== id);
      setExpenses(updated);
      computeSummary(updated);
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const handleAddNew = () => {
    setExpenseToEdit(null); // clear any edit state
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setExpenseToEdit(null);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Navbar />

      <div className="container" style={{ padding: '2rem 1.5rem' }}>

        {/* Page Header */}
        <div style={styles.pageHeader}>
          <div>
            <h1 style={styles.pageTitle}>Dashboard</h1>
            <p style={styles.pageSubtitle}>Track and manage your expenses</p>
          </div>
          <button
            onClick={handleAddNew}
            className="btn btn-primary"
            style={{ fontSize: '0.95rem', padding: '0.65rem 1.25rem' }}
          >
            + Add Expense
          </button>
        </div>

        {/* Summary Cards */}
        <div style={styles.summaryGrid}>
          <SummaryCard
            icon="💸"
            label="Total Spent"
            value={`₹${summary.total.toLocaleString('en-IN')}`}
            color="var(--accent)"
          />
          <SummaryCard
            icon="📅"
            label="This Month"
            value={`₹${summary.thisMonth.toLocaleString('en-IN')}`}
            color="var(--success)"
          />
          <SummaryCard
            icon="🏆"
            label="Top Category"
            value={summary.topCategory}
            color="var(--warning)"
          />
          <SummaryCard
            icon="🧾"
            label="Total Entries"
            value={expenses.length}
            color="var(--text-secondary)"
          />
        </div>

        {/* Filter Controls */}
        <div style={styles.controls}>
          {/* Search */}
          <div style={styles.searchWrapper}>
            <span style={styles.searchIcon}>🔍</span>
            <input
              type="text"
              placeholder="Search expenses..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={styles.searchInput}
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                style={styles.clearBtn}
              >
                ✕
              </button>
            )}
          </div>

          {/* Category Filter Pills */}
          <div style={styles.pills}>
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                style={{
                  ...styles.pill,
                  ...(category === cat ? styles.pillActive : {}),
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Results count */}
        {!loading && (
          <p style={styles.resultCount}>
            Showing {expenses.length} expense{expenses.length !== 1 ? 's' : ''}
            {search && ` for "${search}"`}
            {category !== 'All' && ` in ${category}`}
          </p>
        )}

        {/* Expense List */}
        <ExpenseList
          expenses={expenses}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      {/* Modal Form */}
      {showForm && (
        <ExpenseForm
          onClose={handleCloseForm}
          onSave={handleSave}
          expenseToEdit={expenseToEdit}
        />
      )}
    </div>
  );
};

// ─── Summary Card Component ────────────────────────────────────────────────────
const SummaryCard = ({ icon, label, value, color }) => (
  <div className="card" style={styles.summaryCard}>
    <div style={{ ...styles.summaryIcon, color }}>{icon}</div>
    <div>
      <p style={styles.summaryLabel}>{label}</p>
      <p style={{ ...styles.summaryValue, color }}>{value}</p>
    </div>
  </div>
);

const styles = {
  pageHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '1.75rem',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  pageTitle: {
    fontSize: '1.75rem',
    fontWeight: '700',
    color: 'var(--text-primary)',
  },
  pageSubtitle: {
    color: 'var(--text-muted)',
    fontSize: '0.9rem',
    marginTop: '0.15rem',
  },
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '1rem',
    marginBottom: '1.75rem',
  },
  summaryCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  summaryIcon: { fontSize: '2rem' },
  summaryLabel: {
    fontSize: '0.8rem',
    color: 'var(--text-muted)',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: '0.2rem',
  },
  summaryValue: {
    fontSize: '1.35rem',
    fontWeight: '700',
  },
  controls: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.875rem',
    marginBottom: '1.25rem',
  },
  searchWrapper: {
    position: 'relative',
    maxWidth: '420px',
  },
  searchIcon: {
    position: 'absolute',
    left: '0.75rem',
    top: '50%',
    transform: 'translateY(-50%)',
    pointerEvents: 'none',
    fontSize: '0.95rem',
  },
  searchInput: {
    width: '100%',
    padding: '0.65rem 2.5rem 0.65rem 2.25rem',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-sm)',
    background: 'var(--bg-card)',
    color: 'var(--text-primary)',
    fontSize: '0.9rem',
  },
  clearBtn: {
    position: 'absolute',
    right: '0.6rem',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: 'var(--text-muted)',
    fontSize: '0.85rem',
  },
  pills: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.4rem',
  },
  pill: {
    padding: '0.35rem 0.875rem',
    borderRadius: '999px',
    border: '1px solid var(--border)',
    background: 'var(--bg-card)',
    color: 'var(--text-secondary)',
    fontSize: '0.825rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  pillActive: {
    background: 'var(--accent)',
    color: 'white',
    border: '1px solid var(--accent)',
  },
  resultCount: {
    fontSize: '0.85rem',
    color: 'var(--text-muted)',
    marginBottom: '0.875rem',
  },
};

export default Dashboard;