const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const DB_PATH = process.env.DB_PATH || './database/riss_monitor.db';
const DB_DIR = path.dirname(DB_PATH);

// Ensure database directory exists
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database');
  }
});

// Initialize database tables
const initDatabase = () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Create emails table
      db.run(`
        CREATE TABLE IF NOT EXISTS emails (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email TEXT UNIQUE NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          is_active BOOLEAN DEFAULT 1,
          last_notified_at DATETIME
        )
      `, (err) => {
        if (err) {
          console.error('Error creating emails table:', err);
          reject(err);
          return;
        }
      });

      // Create papers table
      db.run(`
        CREATE TABLE IF NOT EXISTS papers (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          author TEXT,
          publication_date TEXT,
          riss_url TEXT,
          riss_id TEXT UNIQUE,
          abstract TEXT,
          keywords TEXT,
          discovered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          is_notified BOOLEAN DEFAULT 0
        )
      `, (err) => {
        if (err) {
          console.error('Error creating papers table:', err);
          reject(err);
          return;
        }
      });

      // Create notifications table to track what was sent to whom
      db.run(`
        CREATE TABLE IF NOT EXISTS notifications (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email_id INTEGER,
          paper_id INTEGER,
          sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          status TEXT DEFAULT 'sent',
          FOREIGN KEY (email_id) REFERENCES emails (id),
          FOREIGN KEY (paper_id) REFERENCES papers (id)
        )
      `, (err) => {
        if (err) {
          console.error('Error creating notifications table:', err);
          reject(err);
          return;
        }
        resolve();
      });
    });
  });
};

// Database helper functions
const dbHelpers = {
  // Email operations
  addEmail: (email) => {
    return new Promise((resolve, reject) => {
      const stmt = db.prepare('INSERT INTO emails (email) VALUES (?)');
      stmt.run(email, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID, email });
        }
      });
      stmt.finalize();
    });
  },

  getAllEmails: () => {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM emails WHERE is_active = 1', (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  },

  removeEmail: (email) => {
    return new Promise((resolve, reject) => {
      db.run('UPDATE emails SET is_active = 0 WHERE email = ?', email, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ changes: this.changes });
        }
      });
    });
  },

  // Paper operations
  addPaper: (paper) => {
    return new Promise((resolve, reject) => {
      const stmt = db.prepare(`
        INSERT INTO papers (title, author, publication_date, riss_url, riss_id, abstract, keywords)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      stmt.run([
        paper.title,
        paper.author,
        paper.publication_date,
        paper.riss_url,
        paper.riss_id,
        paper.abstract,
        paper.keywords
      ], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID, ...paper });
        }
      });
      stmt.finalize();
    });
  },

  getAllPapers: (limit = 50) => {
    return new Promise((resolve, reject) => {
      db.all(
        'SELECT * FROM papers ORDER BY discovered_at DESC LIMIT ?',
        limit,
        (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows);
          }
        }
      );
    });
  },

  getNewPapers: () => {
    return new Promise((resolve, reject) => {
      db.all(
        'SELECT * FROM papers WHERE is_notified = 0 ORDER BY discovered_at DESC',
        (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows);
          }
        }
      );
    });
  },

  markPaperAsNotified: (paperId) => {
    return new Promise((resolve, reject) => {
      db.run(
        'UPDATE papers SET is_notified = 1 WHERE id = ?',
        paperId,
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({ changes: this.changes });
          }
        }
      );
    });
  },

  paperExists: (rissId) => {
    return new Promise((resolve, reject) => {
      db.get(
        'SELECT id FROM papers WHERE riss_id = ?',
        rissId,
        (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(!!row);
          }
        }
      );
    });
  },

  // Notification operations
  addNotification: (emailId, paperId) => {
    return new Promise((resolve, reject) => {
      const stmt = db.prepare('INSERT INTO notifications (email_id, paper_id) VALUES (?, ?)');
      stmt.run([emailId, paperId], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID });
        }
      });
      stmt.finalize();
    });
  },

  getNotificationStats: () => {
    return new Promise((resolve, reject) => {
      db.all(`
        SELECT 
          COUNT(DISTINCT e.id) as total_subscribers,
          COUNT(DISTINCT p.id) as total_papers,
          COUNT(n.id) as total_notifications
        FROM emails e
        CROSS JOIN papers p
        LEFT JOIN notifications n ON e.id = n.email_id AND p.id = n.paper_id
        WHERE e.is_active = 1
      `, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows[0]);
        }
      });
    });
  }
};

module.exports = {
  db,
  initDatabase,
  ...dbHelpers
};