require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
const { generalLimiter } = require('./middleware/rateLimiter');

const app = express();
const server = http.createServer(app);

// Trust proxy — required for Render, Heroku, and other reverse proxy platforms
app.set('trust proxy', 1);

// Socket.io for live results
const io = new Server(server, {
  cors: { origin: process.env.CLIENT_URL, methods: ['GET', 'POST'] },
});

connectDB();

// Security middleware
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(generalLimiter);

// Attach io to request so controllers can emit events
app.use((req, res, next) => { req.io = io; next(); });

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/elections', require('./routes/electionRoutes'));
app.use('/api/votes', require('./routes/voteRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// Health check
app.get('/api/health', (req, res) => res.json({ success: true, message: 'VoteNG API is running' }));

// 404 handler
app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found' }));

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

io.on('connection', (socket) => {
  socket.on('join-election', (electionId) => socket.join(`election-${electionId}`));
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`VoteNG server running on port ${PORT}`));
