const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

// Load env variables first
dotenv.config();

// Connect to database
connectDB();

const app = express();

// ─── Middleware ────────────────────────────────────────────────────────────────
app.use(express.json());

// CORS — in production the frontend is served by Express itself
// so we only need CORS for local development
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  process.env.CLIENT_URL, // we'll set this on Render
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

// ─── API Routes ───────────────────────────────────────────────────────────────
const authRoutes    = require('./routes/authRoutes');
const expenseRoutes = require('./routes/expenseRoutes');

app.use('/api/auth',     authRoutes);
app.use('/api/expenses', expenseRoutes);

// ─── Serve React Build in Production ─────────────────────────────────────────
if (process.env.NODE_ENV === 'production') {
  // Tell Express where the built React files are
  const clientBuildPath = path.join(__dirname, '../client/dist');
  app.use(express.static(clientBuildPath));

  // For ANY route that isn't an API route, serve the React app
  // This is what makes React Router work on refresh in production
  // NEW — works in Express 5 (Node 24)
app.get('/{*path}', (req, res) => {
  res.sendFile(path.join(clientBuildPath, 'index.html'));
});
} else {
  app.get('/', (req, res) => {
    res.json({ message: 'Smart Expense Tracker API is running ✅' });
  });
}

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});