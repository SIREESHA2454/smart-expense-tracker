const CATEGORY_COLORS = {
  Food:          { bg: '#fef3c7', color: '#92400e' },
  Transport:     { bg: '#dbeafe', color: '#1e40af' },
  Entertainment: { bg: '#fce7f3', color: '#9d174d' },
  Health:        { bg: '#d1fae5', color: '#065f46' },
  Shopping:      { bg: '#ede9fe', color: '#5b21b6' },
  Utilities:     { bg: '#fee2e2', color: '#991b1b' },
  Other:         { bg: '#f1f5f9', color: '#475569' },
};

const ExpenseList = ({ expenses, onEdit, onDelete, loading }) => {

  if (loading) {
    return (
      <div style={styles.centered}>
        <div style={styles.spinner} />
        <p style={{ color: 'var(--text-muted)', marginTop: '1rem' }}>
          Loading expenses...
        </p>
      </div>
    );
  }

  if (expenses.length === 0) {
    return (
      <div style={styles.empty}>
        <p style={styles.emptyIcon}>🧾</p>
        <p style={styles.emptyTitle}>No expenses found</p>
        <p style={styles.emptyText}>
          Add your first expense using the button above
        </p>
      </div>
    );
  }

  return (
    <div style={styles.list}>
      {expenses.map(expense => (
        <ExpenseItem
          key={expense._id}
          expense={expense}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

// ─── Single Expense Item ───────────────────────────────────────────────────────

const ExpenseItem = ({ expense, onEdit, onDelete }) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { bg, color } = CATEGORY_COLORS[expense.category] || CATEGORY_COLORS.Other;

  // Format date nicely: "Jan 15, 2024"
  const formattedDate = new Date(expense.date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div style={styles.item}>
      {/* Left: Category badge + title */}
      <div style={styles.itemLeft}>
        <div style={{ ...styles.categoryBadge, background: bg, color }}>
          {expense.category}
        </div>
        <div>
          <p style={styles.itemTitle}>{expense.title}</p>
          <p style={styles.itemMeta}>
            {formattedDate}
            {expense.notes && ` • ${expense.notes}`}
          </p>
        </div>
      </div>

      {/* Right: Amount + actions */}
      <div style={styles.itemRight}>
        <span style={styles.amount}>
          ₹{Number(expense.amount).toLocaleString('en-IN')}
        </span>

        {!showDeleteConfirm ? (
          <div style={styles.actions}>
            <button
              onClick={() => onEdit(expense)}
              style={styles.actionBtn}
              title="Edit expense"
            >
              ✏️
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              style={{ ...styles.actionBtn, ...styles.deleteBtn }}
              title="Delete expense"
            >
              🗑️
            </button>
          </div>
        ) : (
          // Inline delete confirmation — no popup needed
          <div style={styles.confirmRow}>
            <span style={styles.confirmText}>Delete?</span>
            <button
              onClick={() => onDelete(expense._id)}
              style={styles.confirmYes}
            >
              Yes
            </button>
            <button
              onClick={() => setShowDeleteConfirm(false)}
              style={styles.confirmNo}
            >
              No
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Need useState inside ExpenseItem
import { useState } from 'react';

const styles = {
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  centered: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '3rem',
  },
  spinner: {
    width: '36px',
    height: '36px',
    border: '3px solid var(--border)',
    borderTop: '3px solid var(--accent)',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  empty: {
    textAlign: 'center',
    padding: '4rem 2rem',
    background: 'var(--bg-card)',
    borderRadius: 'var(--radius)',
    border: '1px solid var(--border)',
  },
  emptyIcon: { fontSize: '3rem', marginBottom: '0.75rem' },
  emptyTitle: {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: 'var(--text-primary)',
    marginBottom: '0.4rem',
  },
  emptyText: { color: 'var(--text-muted)', fontSize: '0.9rem' },
  item: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    padding: '1rem 1.25rem',
    transition: 'box-shadow 0.2s',
    gap: '1rem',
  },
  itemLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.875rem',
    flex: 1,
    minWidth: 0, // allows text to truncate
  },
  categoryBadge: {
    padding: '0.25rem 0.625rem',
    borderRadius: '999px',
    fontSize: '0.75rem',
    fontWeight: '600',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  itemTitle: {
    fontWeight: '500',
    color: 'var(--text-primary)',
    fontSize: '0.95rem',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  itemMeta: {
    fontSize: '0.8rem',
    color: 'var(--text-muted)',
    marginTop: '0.15rem',
  },
  itemRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.875rem',
    flexShrink: 0,
  },
  amount: {
    fontSize: '1rem',
    fontWeight: '700',
    color: 'var(--text-primary)',
  },
  actions: { display: 'flex', gap: '0.3rem' },
  actionBtn: {
    background: 'none',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-sm)',
    padding: '0.3rem 0.5rem',
    cursor: 'pointer',
    fontSize: '0.9rem',
    transition: 'all 0.15s',
  },
  deleteBtn: {},
  confirmRow: { display: 'flex', alignItems: 'center', gap: '0.4rem' },
  confirmText: { fontSize: '0.8rem', color: 'var(--danger)', fontWeight: '500' },
  confirmYes: {
    padding: '0.25rem 0.6rem',
    background: 'var(--danger)',
    color: 'white',
    border: 'none',
    borderRadius: 'var(--radius-sm)',
    fontSize: '0.8rem',
    cursor: 'pointer',
    fontWeight: '600',
  },
  confirmNo: {
    padding: '0.25rem 0.6rem',
    background: 'var(--border)',
    color: 'var(--text-primary)',
    border: 'none',
    borderRadius: 'var(--radius-sm)',
    fontSize: '0.8rem',
    cursor: 'pointer',
  },
};

export default ExpenseList;