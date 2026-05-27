import { useState, useEffect } from 'react';
import api from '../api/axios';

const CATEGORIES = [
  'Food', 'Transport', 'Entertainment',
  'Health', 'Shopping', 'Utilities', 'Other'
];

const ExpenseForm = ({ onClose, onSave, expenseToEdit }) => {
  const isEditing = !!expenseToEdit; // true if editing, false if adding

  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    category: 'Food',
    date: new Date().toISOString().split('T')[0], // today's date in YYYY-MM-DD
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // If editing, pre-fill the form with existing expense data
  useEffect(() => {
    if (expenseToEdit) {
      setFormData({
        title: expenseToEdit.title,
        amount: expenseToEdit.amount,
        category: expenseToEdit.category,
        // Format MongoDB date to YYYY-MM-DD for the date input
        date: new Date(expenseToEdit.date).toISOString().split('T')[0],
        notes: expenseToEdit.notes || '',
      });
    }
  }, [expenseToEdit]);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) return setError('Title is required');
    if (!formData.amount || formData.amount <= 0) return setError('Enter a valid amount');

    setLoading(true);
    try {
      let savedExpense;

      if (isEditing) {
        // PUT request to update
        const { data } = await api.put(
          `/expenses/${expenseToEdit._id}`,
          formData
        );
        savedExpense = data;
      } else {
        // POST request to create
        const { data } = await api.post('/expenses', formData);
        savedExpense = data;
      }

      onSave(savedExpense, isEditing); // tell Dashboard what happened
      onClose();

    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    // Backdrop — clicking outside closes the modal
    <div style={styles.backdrop} onClick={onClose}>
      {/* Stop click from bubbling to backdrop */}
      <div style={styles.modal} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={styles.modalHeader}>
          <h2 style={styles.modalTitle}>
            {isEditing ? '✏️ Edit Expense' : '➕ Add Expense'}
          </h2>
          <button onClick={onClose} style={styles.closeBtn}>✕</button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Lunch at restaurant"
              required
            />
          </div>

          {/* Amount and Category side by side */}
          <div style={styles.row}>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Amount (₹)</label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                placeholder="0.00"
                min="0"
                step="0.01"
                required
              />
            </div>

            <div className="form-group" style={{ flex: 1 }}>
              <label>Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Date</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Notes <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span></label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Any additional details..."
              rows={3}
              style={{ resize: 'vertical' }}
            />
          </div>

          {/* Action buttons */}
          <div style={styles.btnRow}>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-ghost"
              style={{ flex: 1 }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ flex: 2 }}
              disabled={loading}
            >
              {loading
                ? (isEditing ? 'Saving...' : 'Adding...')
                : (isEditing ? 'Save Changes' : 'Add Expense')
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const styles = {
  backdrop: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 200,
    padding: '1rem',
    backdropFilter: 'blur(2px)',
  },
  modal: {
    background: 'var(--bg-card)',
    borderRadius: 'var(--radius)',
    boxShadow: 'var(--shadow-md)',
    padding: '2rem',
    width: '100%',
    maxWidth: '500px',
    maxHeight: '90vh',
    overflowY: 'auto',
  },
  modalHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '1.5rem',
  },
  modalTitle: {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: 'var(--text-primary)',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    fontSize: '1.2rem',
    cursor: 'pointer',
    color: 'var(--text-muted)',
    padding: '0.25rem',
    lineHeight: 1,
  },
  row: {
    display: 'flex',
    gap: '1rem',
  },
  btnRow: {
    display: 'flex',
    gap: '0.75rem',
    marginTop: '0.5rem',
  },
};

export default ExpenseForm;