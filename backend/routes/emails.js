const express = require('express');
const router = express.Router();
const { addEmail, getAllEmails, removeEmail } = require('../config/database');

// Email validation function
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Subscribe to notifications
router.post('/subscribe', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ 
        error: 'Email address is required' 
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ 
        error: 'Invalid email address format' 
      });
    }

    const result = await addEmail(email.toLowerCase().trim());
    
    res.json({
      success: true,
      message: '이메일 구독이 성공적으로 등록되었습니다!',
      data: result
    });

  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT') {
      return res.status(409).json({
        error: '이미 등록된 이메일 주소입니다.'
      });
    }

    console.error('Email subscription error:', error);
    res.status(500).json({
      error: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
    });
  }
});

// Unsubscribe from notifications
router.post('/unsubscribe', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ 
        error: 'Email address is required' 
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ 
        error: 'Invalid email address format' 
      });
    }

    const result = await removeEmail(email.toLowerCase().trim());
    
    if (result.changes === 0) {
      return res.status(404).json({
        error: '해당 이메일 주소를 찾을 수 없습니다.'
      });
    }

    res.json({
      success: true,
      message: '구독이 성공적으로 해지되었습니다.'
    });

  } catch (error) {
    console.error('Email unsubscription error:', error);
    res.status(500).json({
      error: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
    });
  }
});

// Get all subscribed emails (admin only - add authentication later if needed)
router.get('/', async (req, res) => {
  try {
    const emails = await getAllEmails();
    
    res.json({
      success: true,
      data: emails.map(email => ({
        id: email.id,
        email: email.email,
        created_at: email.created_at,
        last_notified_at: email.last_notified_at
      })),
      count: emails.length
    });

  } catch (error) {
    console.error('Get emails error:', error);
    res.status(500).json({
      error: '서버 오류가 발생했습니다.'
    });
  }
});

// Check if email is subscribed
router.get('/check/:email', async (req, res) => {
  try {
    const { email } = req.params;

    if (!isValidEmail(email)) {
      return res.status(400).json({ 
        error: 'Invalid email address format' 
      });
    }

    const emails = await getAllEmails();
    const isSubscribed = emails.some(e => e.email === email.toLowerCase().trim());
    
    res.json({
      success: true,
      subscribed: isSubscribed
    });

  } catch (error) {
    console.error('Check email error:', error);
    res.status(500).json({
      error: '서버 오류가 발생했습니다.'
    });
  }
});

module.exports = router;