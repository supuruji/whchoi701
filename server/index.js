const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
require('dotenv').config();

const emailRoutes = require('./routes/email');
const paperRoutes = require('./routes/papers');
const adminRoutes = require('./routes/admin');
const { initializeDatabase } = require('./database/init');
const { startCrawlerSchedule } = require('./services/crawler');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../client/dist')));

// Routes
app.use('/api/email', emailRoutes);
app.use('/api/papers', paperRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'RISS Paper Notification System'
  });
});

// Serve React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Initialize database and start server
async function startServer() {
  try {
    await initializeDatabase();
    console.log('✅ Database initialized successfully');
    
    // Start the crawler schedule
    startCrawlerSchedule();
    console.log('✅ Crawler schedule started');
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📧 RISS Paper Notification System is ready!`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();