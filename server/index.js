const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();

// 1. Body parsing middleware
app.use(express.json());

// 2. CORS
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

// 3. API routes FIRST — before static files
const authRoutes    = require('./routes/authRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
app.use('/api/auth',     authRoutes);
app.use('/api/expenses', expenseRoutes);

// 4. Static files + React catch-all LAST
if (process.env.NODE_ENV === 'production') {
  const clientBuildPath = path.resolve(__dirname, '..', 'client', 'dist');

  // Serve static assets (JS, CSS, images)
  app.use(express.static(clientBuildPath));

  // All non-API routes → React app
  app.get('/{*path}', (req, res) => {
    res.sendFile(path.join(clientBuildPath, 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.json({ message: 'Smart Expense Tracker API is running ✅' });
  });
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});