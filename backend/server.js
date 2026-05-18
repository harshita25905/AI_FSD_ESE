require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = async () => {
    try {
        const conn = await require('./config/db');
        await conn();
    } catch (err) {
        console.error('Database connection failed', err);
    }
};

// Initialize DB Connection
connectDB();

const app = express();

// Middlewares
app.use(cors({
    origin: '*', // Allows integration from anywhere, perfect for local dev and deploy
    credentials: true
}));
app.use(express.json());

// Import Routes
const authRoutes = require('./routes/auth');
const employeeRoutes = require('./routes/employee');
const aiRoutes = require('./routes/ai');

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/ai', aiRoutes);

// Base route for sanity check
app.get('/', (req, res) => {
    res.json({ message: 'Employee Performance Analytics API is running...' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server Error Stack:', err.stack);
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode).json({
        message: err.message || 'Internal Server Error',
        stack: process.env.NODE_ENV === 'production' ? null : err.stack
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
