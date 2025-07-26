const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, '../data/riss_notifications.db');

// Create database connection
function getDatabase() {
  return new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
      console.error('Error opening database:', err.message);
      throw err;
    }
  });
}

// Initialize database tables
async function initializeDatabase() {
  return new Promise((resolve, reject) => {
    const db = getDatabase();
    
    // Create emails table
    const createEmailsTable = `
      CREATE TABLE IF NOT EXISTS emails (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        is_active BOOLEAN DEFAULT 1
      )
    `;
    
    // Create papers table
    const createPapersTable = `
      CREATE TABLE IF NOT EXISTS papers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        author TEXT,
        publication_year TEXT,
        url TEXT,
        riss_id TEXT UNIQUE,
        keyword TEXT DEFAULT '주역',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        notified BOOLEAN DEFAULT 0
      )
    `;
    
    // Create notification_logs table
    const createNotificationLogsTable = `
      CREATE TABLE IF NOT EXISTS notification_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        paper_id INTEGER,
        email TEXT,
        sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        status TEXT DEFAULT 'sent',
        FOREIGN KEY (paper_id) REFERENCES papers (id)
      )
    `;
    
    db.serialize(() => {
      db.run(createEmailsTable, (err) => {
        if (err) {
          console.error('Error creating emails table:', err);
          reject(err);
          return;
        }
        console.log('✅ Emails table ready');
      });
      
      db.run(createPapersTable, (err) => {
        if (err) {
          console.error('Error creating papers table:', err);
          reject(err);
          return;
        }
        console.log('✅ Papers table ready');
      });
      
      db.run(createNotificationLogsTable, (err) => {
        if (err) {
          console.error('Error creating notification_logs table:', err);
          reject(err);
          return;
        }
        console.log('✅ Notification logs table ready');
        
        db.close((err) => {
          if (err) {
            console.error('Error closing database:', err);
            reject(err);
          } else {
            resolve();
          }
        });
      });
    });
  });
}

module.exports = {
  getDatabase,
  initializeDatabase,
  DB_PATH
};