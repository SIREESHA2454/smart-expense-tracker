import { useState, useEffect } from 'react';
import { Line, Doughnut } from 'react-chartjs-2';
import Navbar from '../components/Navbar';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import {
  buildMonthlyChartData,
  buildCategoryChartData,
  lineChartOptions,
  doughnutOptions,
  CATEGORY_COLORS,
} from '../utils/analyticsHelpers';
import { exportExpensesToPDF } from '../utils/exportPDF';

const Analytics = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [expenses, setExpenses]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [isDark, setIsDark]       = useState(false);

  useEffect(() => {
    // Check current theme
    setIsDark(document.documentElement.getAttribute('data-theme') === 'dark');

    const fetchData = async () => {
      try {
        // Fetch analytics and full expense list in parallel
        // Promise.all fires both requests simultaneously — faster than sequential
        const [analyticsRes, expensesRes] = await Promise.all([
          api.get('/expenses/analytics'),
          api.get('/expenses'),
        ]);
        setAnalytics(analyticsRes.data);
        setExpenses(expensesRes.data);
      } catch (err) {
        console.error('Analytics fetch failed:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleExportPDF = () => {
    if (!expenses.length) return;

    const topCategory = analytics?.categoryTotals?.[0]?._id || '—';

    exportExpensesToPDF(
      expenses,
      {
        total: analytics?.totalSpent || 0,
        count: expenses.length,
        topCategory,
      },
      user?.name || 'User'
    );
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
        <Navbar />
        <div style={styles.loadingCenter}>
          <div style={styles.spinner} />
          <p style={{ color: 'var(--text-muted)', marginTop: '1rem' }}>
            Loading analytics...
          </p>
        </div>
      </div>
    );
  }

  const hasData = analytics?.categoryTotals?.length > 0;

  const monthlyData  = buildMonthlyChartData(analytics?.monthlyTotals || []);
  const categoryData = buildCategoryChartData(analytics?.categoryTotals || []);

  // Highest spending month name
  const maxMonthIdx = (analytics?.monthlyTotals || []).reduce(
    (maxIdx, item, _, arr) =>
      item.total > (arr[maxIdx]?.total || 0) ? arr.indexOf(item) : maxIdx,
    0
  );
  const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const peakMonth  = analytics?.monthlyTotals?.[maxMonthIdx]
    ? monthNames[(analytics.monthlyTotals[maxMonthIdx]._id) - 1]
    : '—';

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Navbar />

      <div className="container" style={{ padding: '2rem 1.5rem' }}>

        {/* Page Header */}
        <div style={styles.pageHeader}>
          <div>
            <h1 style={styles.pageTitle}>Analytics</h1>
            <p style={styles.pageSubtitle}>
              Spending insights for {new Date().getFullYear()}
            </p>
          </div>

          <button
            onClick={handleExportPDF}
            className="btn btn-ghost"
            disabled={!expenses.length}
            style={{ fontSize: '0.9rem' }}
          >
            📄 Export PDF
          </button>
        </div>

        {!hasData ? (
          <div style={styles.emptyState}>
            <p style={{ fontSize: '3rem' }}>📊</p>
            <p style={styles.emptyTitle}>No data yet</p>
            <p style={styles.emptyText}>
              Add some expenses to see your analytics
            </p>
          </div>
        ) : (
          <>
            {/* Stat Cards Row */}
            <div style={styles.statsGrid}>
              <StatCard
                label="Total Spent"
                value={`₹${(analytics.totalSpent || 0).toLocaleString('en-IN')}`}
                icon="💸"
                sub={`${expenses.length} transactions`}
              />
              <StatCard
                label="Monthly Average"
                value={`₹${Math.round(
                  (analytics.totalSpent || 0) /
                  Math.max(analytics.monthlyTotals?.length || 1, 1)
                ).toLocaleString('en-IN')}`}
                icon="📅"
                sub="per active month"
              />
              <StatCard
                label="Peak Month"
                value={peakMonth}
                icon="📈"
                sub={`₹${(
                  analytics.monthlyTotals?.find(
                    m => monthNames[m._id - 1] === peakMonth
                  )?.total || 0
                ).toLocaleString('en-IN')}`}
              />
              <StatCard
                label="Top Category"
                value={analytics.categoryTotals?.[0]?._id || '—'}
                icon="🏆"
                sub={`₹${(
                  analytics.categoryTotals?.[0]?.total || 0
                ).toLocaleString('en-IN')}`}
              />
            </div>

            {/* Charts Row */}
            <div style={styles.chartsGrid}>

              {/* Monthly Line Chart */}
              <div className="card" style={styles.chartCard}>
                <h2 style={styles.chartTitle}>📅 Monthly Spending</h2>
                <p style={styles.chartSubtitle}>
                  Your spending trend throughout {new Date().getFullYear()}
                </p>
                <div style={styles.chartWrapper}>
                  <Line
                    data={monthlyData}
                    options={lineChartOptions(isDark)}
                  />
                </div>
              </div>

              {/* Category Doughnut */}
              <div className="card" style={styles.chartCard}>
                <h2 style={styles.chartTitle}>🍩 By Category</h2>
                <p style={styles.chartSubtitle}>
                  Where your money goes
                </p>
                <div style={{ ...styles.chartWrapper, height: '260px' }}>
                  <Doughnut
                    data={categoryData}
                    options={doughnutOptions}
                  />
                </div>
              </div>
            </div>

            {/* Category Breakdown Table */}
            <div className="card" style={{ marginTop: '1.5rem' }}>
              <h2 style={{ ...styles.chartTitle, marginBottom: '1.25rem' }}>
                📋 Category Breakdown
              </h2>

              <div style={styles.breakdownList}>
                {analytics.categoryTotals.map((cat, index) => {
                  const pct = (
                    (cat.total / analytics.totalSpent) * 100
                  ).toFixed(1);

                  return (
                    <div key={cat._id} style={styles.breakdownRow}>
                      {/* Color dot + name */}
                      <div style={styles.breakdownLeft}>
                        <div style={{
                          ...styles.colorDot,
                          background: CATEGORY_COLORS[index] || '#94a3b8'
                        }} />
                        <span style={styles.catName}>{cat._id}</span>
                        <span style={styles.catCount}>
                          {cat.count} expense{cat.count !== 1 ? 's' : ''}
                        </span>
                      </div>

                      {/* Progress bar + amount */}
                      <div style={styles.breakdownRight}>
                        <div style={styles.barTrack}>
                          <div style={{
                            ...styles.barFill,
                            width: `${pct}%`,
                            background: CATEGORY_COLORS[index] || '#94a3b8',
                          }} />
                        </div>
                        <span style={styles.catPct}>{pct}%</span>
                        <span style={styles.catAmount}>
                          ₹{cat.total.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// ─── Stat Card ─────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, icon, sub }) => (
  <div className="card" style={styles.statCard}>
    <span style={styles.statIcon}>{icon}</span>
    <p style={styles.statLabel}>{label}</p>
    <p style={styles.statValue}>{value}</p>
    <p style={styles.statSub}>{sub}</p>
  </div>
);

const styles = {
  loadingCenter: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '60vh',
  },
  spinner: {
    width: '36px',
    height: '36px',
    border: '3px solid var(--border)',
    borderTop: '3px solid var(--accent)',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
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
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem',
    marginBottom: '1.5rem',
  },
  statCard: {
    textAlign: 'center',
    padding: '1.5rem 1rem',
  },
  statIcon: { fontSize: '1.75rem' },
  statLabel: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    fontWeight: '600',
    marginTop: '0.5rem',
  },
  statValue: {
    fontSize: '1.4rem',
    fontWeight: '700',
    color: 'var(--text-primary)',
    margin: '0.3rem 0',
  },
  statSub: {
    fontSize: '0.8rem',
    color: 'var(--text-muted)',
  },
  chartsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '1.5rem',
  },
  chartCard: { padding: '1.5rem' },
  chartTitle: {
    fontSize: '1rem',
    fontWeight: '700',
    color: 'var(--text-primary)',
    marginBottom: '0.2rem',
  },
  chartSubtitle: {
    fontSize: '0.825rem',
    color: 'var(--text-muted)',
    marginBottom: '1.25rem',
  },
  chartWrapper: {
    height: '280px',
    position: 'relative',
  },
  breakdownList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  breakdownRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '1rem',
    flexWrap: 'wrap',
  },
  breakdownLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.625rem',
    minWidth: '160px',
  },
  colorDot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    flexShrink: 0,
  },
  catName: {
    fontWeight: '600',
    fontSize: '0.9rem',
    color: 'var(--text-primary)',
  },
  catCount: {
    fontSize: '0.78rem',
    color: 'var(--text-muted)',
  },
  breakdownRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    flex: 1,
    justifyContent: 'flex-end',
  },
  barTrack: {
    flex: 1,
    maxWidth: '180px',
    height: '6px',
    background: 'var(--border)',
    borderRadius: '999px',
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: '999px',
    transition: 'width 0.5s ease',
  },
  catPct: {
    fontSize: '0.825rem',
    color: 'var(--text-muted)',
    fontWeight: '500',
    minWidth: '38px',
    textAlign: 'right',
  },
  catAmount: {
    fontSize: '0.9rem',
    fontWeight: '700',
    color: 'var(--text-primary)',
    minWidth: '90px',
    textAlign: 'right',
  },
  emptyState: {
    textAlign: 'center',
    padding: '5rem 2rem',
  },
  emptyTitle: {
    fontSize: '1.2rem',
    fontWeight: '600',
    color: 'var(--text-primary)',
    margin: '0.75rem 0 0.4rem',
  },
  emptyText: {
    color: 'var(--text-muted)',
    fontSize: '0.9rem',
  },
};

export default Analytics;