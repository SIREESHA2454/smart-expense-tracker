// Month names for labels
const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

// Colors for category doughnut chart
export const CATEGORY_COLORS = [
  '#6366f1', // indigo  - Food
  '#3b82f6', // blue    - Transport
  '#ec4899', // pink    - Entertainment
  '#22c55e', // green   - Health
  '#a855f7', // purple  - Shopping
  '#ef4444', // red     - Utilities
  '#94a3b8', // gray    - Other
];

// Transform monthly totals from API into Chart.js line chart format
// API gives: [{ _id: 1, total: 3200 }, { _id: 3, total: 5400 }]
// Months with no spending are missing — we fill them with 0
export const buildMonthlyChartData = (monthlyTotals) => {
  // Create array of 12 zeros (one per month)
  const amounts = new Array(12).fill(0);

  // Fill in actual values where data exists
  monthlyTotals.forEach(({ _id, total }) => {
    amounts[_id - 1] = total; // _id is 1-based month number
  });

  return {
    labels: MONTH_NAMES,
    datasets: [
      {
        label: 'Monthly Spending (₹)',
        data: amounts,
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99, 102, 241, 0.08)',
        borderWidth: 2.5,
        pointBackgroundColor: '#6366f1',
        pointRadius: 4,
        pointHoverRadius: 6,
        fill: true,   // fills area under the line
        tension: 0.4, // makes line curved instead of sharp
      },
    ],
  };
};

// Transform category totals into doughnut chart format
export const buildCategoryChartData = (categoryTotals) => {
  return {
    labels: categoryTotals.map(c => c._id),
    datasets: [
      {
        data: categoryTotals.map(c => c.total),
        backgroundColor: CATEGORY_COLORS.slice(0, categoryTotals.length),
        borderColor: 'transparent',
        borderWidth: 0,
        hoverOffset: 8,
      },
    ],
  };
};

// Shared chart options for consistent styling
export const lineChartOptions = (isDark) => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false }, // we'll build custom legend
    tooltip: {
      backgroundColor: isDark ? '#1e293b' : '#ffffff',
      titleColor: isDark ? '#f1f5f9' : '#1e293b',
      bodyColor: isDark ? '#94a3b8' : '#64748b',
      borderColor: isDark ? '#334155' : '#e2e8f0',
      borderWidth: 1,
      padding: 12,
      callbacks: {
        // Format tooltip value with ₹ symbol
        label: (ctx) => ` ₹${ctx.parsed.y.toLocaleString('en-IN')}`,
      },
    },
  },
  scales: {
    x: {
      grid: { color: isDark ? '#1e293b' : '#f1f5f9' },
      ticks: { color: isDark ? '#64748b' : '#94a3b8', fontSize: 12 },
    },
    y: {
      grid: { color: isDark ? '#1e293b' : '#f1f5f9' },
      ticks: {
        color: isDark ? '#64748b' : '#94a3b8',
        callback: (val) => `₹${val.toLocaleString('en-IN')}`,
      },
      beginAtZero: true,
    },
  },
});

export const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: '72%', // controls the hole size
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        padding: 16,
        usePointStyle: true,
        pointStyleWidth: 8,
        font: { size: 12 },
      },
    },
    tooltip: {
      callbacks: {
        label: (ctx) => {
          const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
          const pct = ((ctx.parsed / total) * 100).toFixed(1);
          return ` ₹${ctx.parsed.toLocaleString('en-IN')} (${pct}%)`;
        },
      },
    },
  },
};