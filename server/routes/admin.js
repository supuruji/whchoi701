const express = require('express');
const { runCrawlerManually } = require('../services/crawler');

const router = express.Router();

// Manual crawler trigger
router.post('/crawl', async (req, res) => {
  try {
    console.log('🔧 Manual crawler triggered by admin');
    
    // Start the crawler in background
    const crawlerPromise = runCrawlerManually();
    
    // Don't wait for completion, just acknowledge the request
    res.json({
      message: '크롤링을 시작했습니다. 결과는 잠시 후 확인하세요.',
      timestamp: new Date().toISOString()
    });
    
    // Log the result when done
    crawlerPromise
      .then(result => {
        console.log('✅ Manual crawler completed:', result);
      })
      .catch(error => {
        console.error('❌ Manual crawler failed:', error);
      });
      
  } catch (error) {
    console.error('Admin crawler trigger error:', error);
    res.status(500).json({ 
      error: 'Failed to trigger crawler',
      message: error.message 
    });
  }
});

// System status check
router.get('/status', async (req, res) => {
  try {
    const status = {
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      node_version: process.version,
      environment: process.env.NODE_ENV || 'development',
      crawler: {
        status: 'running',
        next_run: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString()
      },
      email_service: {
        configured: !!(process.env.SMTP_USER && process.env.SMTP_PASS),
        host: process.env.SMTP_HOST || 'not configured'
      }
    };
    
    res.json(status);
  } catch (error) {
    console.error('Status check error:', error);
    res.status(500).json({ 
      error: 'Failed to get system status',
      message: error.message 
    });
  }
});

module.exports = router;