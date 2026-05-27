import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

// Register all components we'll use across the app
// Must be done once before any chart renders
ChartJS.register(
  CategoryScale,   // X-axis with string labels (months)
  LinearScale,     // Y-axis with numbers
  PointElement,    // Dots on line charts
  LineElement,     // Lines connecting dots
  BarElement,      // Bars for bar charts
  ArcElement,      // Slices for doughnut/pie charts
  Title,           // Chart title
  Tooltip,         // Hover tooltips
  Legend,          // Legend labels
  Filler,          // Fill area under line
);