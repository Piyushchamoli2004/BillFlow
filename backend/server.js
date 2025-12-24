const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const billRoutes = require('./routes/bills');
const tenantRoutes = require('./routes/tenants');

// Initialize express app
const app = express();

// Middleware
// Security middleware
app.use(helmet());

// CORS: allow local development origins
const allowedOrigins = process.env.NODE_ENV === 'production'
    ? [
        process.env.FRONTEND_URL,
        'https://comfy-genie-f9a130.netlify.app'
      ]
    : [
        'http://localhost:5500',
        'http://localhost:5501',
        'http://localhost:5502',
        'http://localhost:3000',
        'http://127.0.0.1:5500',
        'http://127.0.0.1:5501',
        'http://127.0.0.1:5502',
        'http://127.0.0.1:3000',
        'https://comfy-genie-f9a130.netlify.app'
    ];

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        if (process.env.NODE_ENV === 'production') {
            if (allowedOrigins.indexOf(origin) === -1) {
                return callback(new Error('CORS policy: origin not allowed'), false);
            }
        }
        return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
mongoose.connect(process.env.MONGODB_URI)
.then(() => {
    if (process.env.NODE_ENV !== 'production') {
        console.log('✅ MongoDB Connected Successfully');
        console.log(`📦 Database: ${mongoose.connection.name}`);
    }
})
.catch((error) => {
    console.error('❌ MongoDB Connection Error:', error.message);
    process.exit(1);
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/bills', billRoutes);
app.use('/api/tenants', tenantRoutes);

// Health check route
app.get('/api/health', (req, res) => {
    res.json({
        status: 'success',
        message: 'BillFlow API is running',
        timestamp: new Date().toISOString()
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        status: 'error',
        message: 'Route not found'
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err.message);
    res.status(err.statusCode || 500).json({
        status: 'error',
        message: err.message || 'Internal Server Error'
    });
});

// Start server
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';
const server = app.listen(PORT, HOST, () => {
    if (process.env.NODE_ENV !== 'production') {
        console.log('🚀 BillFlow Backend Server Started');
        console.log(`🌐 Server running on http://localhost:${PORT}`);
        console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log('');
        console.log('Available endpoints:');
        console.log(`   GET  http://localhost:${PORT}/api/health`);
        console.log(`   POST http://localhost:${PORT}/api/auth/register`);
        console.log(`   POST http://localhost:${PORT}/api/auth/login`);
        console.log(`   GET  http://localhost:${PORT}/api/user/profile`);
    }
});

// Handle server errors
server.on('error', (error) => {
    console.error('❌ Server Error:', error.message);
    process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (error) => {
    console.error('❌ Unhandled Promise Rejection:', error);
    server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
    process.exit(1);
});
