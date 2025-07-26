const express = require('express');
const Joi = require('joi');
const { getDatabase } = require('../database/init');

const router = express.Router();

// Email validation schema
const emailSchema = Joi.object({
  email: Joi.string().email().required()
});

// Register new email
router.post('/register', async (req, res) => {
  try {
    const { error, value } = emailSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        error: 'Invalid email format',
        details: error.details[0].message 
      });
    }

    const { email } = value;
    const db = getDatabase();

    // Check if email already exists
    db.get('SELECT email FROM emails WHERE email = ?', [email], (err, row) => {
      if (err) {
        console.error('Database error:', err);
        db.close();
        return res.status(500).json({ error: 'Database error' });
      }

      if (row) {
        db.close();
        return res.status(409).json({ 
          error: 'Email already registered',
          message: '이미 등록된 이메일입니다.' 
        });
      }

      // Insert new email
      db.run('INSERT INTO emails (email) VALUES (?)', [email], function(err) {
        if (err) {
          console.error('Insert error:', err);
          db.close();
          return res.status(500).json({ error: 'Failed to register email' });
        }

        console.log(`✅ New email registered: ${email}`);
        db.close();
        res.status(201).json({ 
          message: '이메일이 성공적으로 등록되었습니다!',
          id: this.lastID,
          email: email
        });
      });
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all registered emails (admin function)
router.get('/list', async (req, res) => {
  try {
    const db = getDatabase();
    
    db.all(
      'SELECT id, email, created_at, is_active FROM emails ORDER BY created_at DESC',
      [],
      (err, rows) => {
        if (err) {
          console.error('Database error:', err);
          db.close();
          return res.status(500).json({ error: 'Database error' });
        }
        
        db.close();
        res.json({
          emails: rows,
          total: rows.length
        });
      }
    );
  } catch (error) {
    console.error('List emails error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Unsubscribe email
router.delete('/unsubscribe/:email', async (req, res) => {
  try {
    const { email } = req.params;
    
    // Validate email format
    const { error } = emailSchema.validate({ email });
    if (error) {
      return res.status(400).json({ 
        error: 'Invalid email format' 
      });
    }

    const db = getDatabase();
    
    db.run(
      'UPDATE emails SET is_active = 0 WHERE email = ?',
      [email],
      function(err) {
        if (err) {
          console.error('Unsubscribe error:', err);
          db.close();
          return res.status(500).json({ error: 'Database error' });
        }
        
        if (this.changes === 0) {
          db.close();
          return res.status(404).json({ 
            error: '등록되지 않은 이메일입니다.' 
          });
        }
        
        console.log(`📧 Email unsubscribed: ${email}`);
        db.close();
        res.json({ 
          message: '구독이 취소되었습니다.',
          email: email
        });
      }
    );
  } catch (error) {
    console.error('Unsubscribe error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get subscription status
router.get('/status/:email', async (req, res) => {
  try {
    const { email } = req.params;
    
    const { error } = emailSchema.validate({ email });
    if (error) {
      return res.status(400).json({ 
        error: 'Invalid email format' 
      });
    }

    const db = getDatabase();
    
    db.get(
      'SELECT email, is_active, created_at FROM emails WHERE email = ?',
      [email],
      (err, row) => {
        if (err) {
          console.error('Database error:', err);
          db.close();
          return res.status(500).json({ error: 'Database error' });
        }
        
        db.close();
        
        if (!row) {
          return res.status(404).json({ 
            subscribed: false,
            message: '등록되지 않은 이메일입니다.' 
          });
        }
        
        res.json({
          subscribed: Boolean(row.is_active),
          email: row.email,
          registered_at: row.created_at
        });
      }
    );
  } catch (error) {
    console.error('Status check error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;