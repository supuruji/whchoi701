const express = require('express');
const { getDatabase } = require('../database/init');

const router = express.Router();

// Get all papers with pagination
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    
    const db = getDatabase();
    
    // Get total count
    db.get('SELECT COUNT(*) as total FROM papers', [], (err, countResult) => {
      if (err) {
        console.error('Count error:', err);
        db.close();
        return res.status(500).json({ error: 'Database error' });
      }
      
      const total = countResult.total;
      
      // Get papers with pagination
      db.all(
        `SELECT 
          id, title, author, publication_year, url, 
          keyword, created_at, notified 
         FROM papers 
         ORDER BY created_at DESC 
         LIMIT ? OFFSET ?`,
        [limit, offset],
        (err, rows) => {
          if (err) {
            console.error('Papers query error:', err);
            db.close();
            return res.status(500).json({ error: 'Database error' });
          }
          
          db.close();
          res.json({
            papers: rows,
            pagination: {
              current_page: page,
              total_pages: Math.ceil(total / limit),
              total_items: total,
              items_per_page: limit
            }
          });
        }
      );
    });
  } catch (error) {
    console.error('Get papers error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get recent papers (last 30 days)
router.get('/recent', async (req, res) => {
  try {
    const db = getDatabase();
    
    db.all(
      `SELECT 
        id, title, author, publication_year, url, 
        keyword, created_at, notified 
       FROM papers 
       WHERE created_at >= datetime('now', '-30 days')
       ORDER BY created_at DESC`,
      [],
      (err, rows) => {
        if (err) {
          console.error('Recent papers error:', err);
          db.close();
          return res.status(500).json({ error: 'Database error' });
        }
        
        db.close();
        res.json({
          papers: rows,
          count: rows.length
        });
      }
    );
  } catch (error) {
    console.error('Get recent papers error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get paper statistics
router.get('/stats', async (req, res) => {
  try {
    const db = getDatabase();
    
    const queries = [
      'SELECT COUNT(*) as total FROM papers',
      'SELECT COUNT(*) as recent FROM papers WHERE created_at >= datetime("now", "-7 days")',
      'SELECT COUNT(*) as notified FROM papers WHERE notified = 1',
      'SELECT COUNT(*) as active_emails FROM emails WHERE is_active = 1'
    ];
    
    let stats = {};
    let completed = 0;
    
    queries.forEach((query, index) => {
      db.get(query, [], (err, result) => {
        if (err) {
          console.error(`Stats query ${index} error:`, err);
          if (completed === 0) {
            db.close();
            return res.status(500).json({ error: 'Database error' });
          }
          return;
        }
        
        const key = Object.keys(result)[0];
        stats[key] = result[key];
        completed++;
        
        if (completed === queries.length) {
          db.close();
          res.json(stats);
        }
      });
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Search papers by title or author
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.trim().length < 2) {
      return res.status(400).json({ 
        error: 'Search query must be at least 2 characters long' 
      });
    }
    
    const searchTerm = `%${q.trim()}%`;
    const db = getDatabase();
    
    db.all(
      `SELECT 
        id, title, author, publication_year, url, 
        keyword, created_at, notified 
       FROM papers 
       WHERE title LIKE ? OR author LIKE ?
       ORDER BY created_at DESC
       LIMIT 50`,
      [searchTerm, searchTerm],
      (err, rows) => {
        if (err) {
          console.error('Search error:', err);
          db.close();
          return res.status(500).json({ error: 'Database error' });
        }
        
        db.close();
        res.json({
          papers: rows,
          query: q,
          count: rows.length
        });
      }
    );
  } catch (error) {
    console.error('Search papers error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get a specific paper by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!Number.isInteger(parseInt(id))) {
      return res.status(400).json({ error: 'Invalid paper ID' });
    }
    
    const db = getDatabase();
    
    db.get(
      `SELECT 
        id, title, author, publication_year, url, 
        riss_id, keyword, created_at, notified 
       FROM papers 
       WHERE id = ?`,
      [id],
      (err, row) => {
        if (err) {
          console.error('Get paper error:', err);
          db.close();
          return res.status(500).json({ error: 'Database error' });
        }
        
        if (!row) {
          db.close();
          return res.status(404).json({ error: 'Paper not found' });
        }
        
        db.close();
        res.json(row);
      }
    );
  } catch (error) {
    console.error('Get paper by ID error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;