require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const webpush = require('web-push');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/auth');
const roomRoutes = require('./routes/rooms');
const bookingRoutes = require('./routes/bookings');
const uploadRoutes = require('./routes/upload');
const notificationRoutes = require('./routes/notifications');
const { initCronJobs } = require('./utils/cronJob');

// Connect to database
connectDB().then(() => {
    // Initialize cron jobs after DB connection
    initCronJobs();
});

const app = express();
const httpServer = http.createServer(app);

// Configure CORS allowed origins
const allowedOrigins = [
    'http://localhost:5173',
    'https://hadeshouse.vercel.app' // Vercel deployment
];
if (process.env.CLIENT_URL) allowedOrigins.push(process.env.CLIENT_URL);

// Setup VAPID for Web Push
webpush.setVapidDetails(
    process.env.VAPID_EMAIL,
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
);

// Setup Socket.io
const io = new Server(httpServer, {
    cors: {
        origin: allowedOrigins,
        credentials: true,
    },
});

// Export io để dùng trong controllers
app.set('io', io);

// Socket.io connection handling
io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Client đăng ký vào room của mình sau khi login
    socket.on('join', (userId) => {
        if (userId) {
            socket.join(`user:${userId}`);
            console.log(`User ${userId} joined room`);
        }
    });

    socket.on('disconnect', () => {
        console.log(`Socket disconnected: ${socket.id}`);
    });
});

// Middleware
app.use(cors({
    origin: allowedOrigins,
    credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Hades House API is running' });
});

// Serve frontend locally in production
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../client/dist')));
    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, '../client', 'dist', 'index.html'));
    });
}

// Error handler (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
    console.log(`🔌 Socket.io ready`);
});
