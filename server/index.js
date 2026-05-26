const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// Load environment variables FIRST, before anything else
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// ─── Middleware ────────────────────────────────────────────────────────────────

// Allow Express to read JSON from request bodies
app.use(express.json());

// Allow your React app to make requests to this server
app.use(cors({
  origin: 'http://localhost:5173', // Vite's default port
  credentials: true,
}));

// ─── Routes ───────────────────────────────────────────────────────────────────

// Health check route - useful to verify the server is running
app.get('/', (req, res) => {
  res.json({ message: 'Smart Expense Tracker API is running ✅' });
});

// ─── Start Server ─────────────────────────────────────────────────────────────

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});