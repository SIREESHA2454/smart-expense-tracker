const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();

// Body parser
app.use(express.json());

// CORS
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'https://expense-tracker-client-dinz.onrender.com',  // ← hardcoded as fallback
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    console.log('Blocked by CORS:', origin); // helpful for debugging
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

// Routes
const authRoutes = require('./routes/authRoutes');
const expenseRoutes = require('./routes/expenseRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/expenses', expenseRoutes);

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'Expense Tracker API Running ✅' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Allowed origins:', allowedOrigins); // confirm on startup
});