const nodemailer = require('nodemailer');
const { getDatabase } = require('../database/init');

// Email configuration
const emailConfig = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
};

// Create email transporter
function createTransporter() {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('⚠️  Email credentials not configured. Notifications will be logged only.');
    return null;
  }
  
  try {
    return nodemailer.createTransporter(emailConfig);
  } catch (error) {
    console.error('❌ Failed to create email transporter:', error);
    return null;
  }
}

// Generate email HTML template
function generateEmailHTML(papers) {
  const papersList = papers.map(paper => `
    <div style="margin-bottom: 20px; padding: 15px; border-left: 4px solid #4CAF50; background-color: #f9f9f9;">
      <h3 style="margin: 0 0 10px 0; color: #333;">
        <a href="${paper.url}" style="color: #2196F3; text-decoration: none;">${paper.title}</a>
      </h3>
      <p style="margin: 5px 0; color: #666;">
        <strong>저자:</strong> ${paper.author || '정보 없음'}
      </p>
      <p style="margin: 5px 0; color: #666;">
        <strong>발행년도:</strong> ${paper.publicationYear || '정보 없음'}
      </p>
      <p style="margin: 5px 0;">
        <a href="${paper.url}" style="background-color: #4CAF50; color: white; padding: 8px 16px; text-decoration: none; border-radius: 4px; font-size: 14px;">논문 보기</a>
      </p>
    </div>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>RISS 주역 논문 알림</title>
    </head>
    <body style="font-family: 'Malgun Gothic', Arial, sans-serif; line-height: 1.6; margin: 0; padding: 20px; background-color: #f4f4f4;">
      <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
        
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #333; margin: 0;">📚 RISS 주역 논문 알림</h1>
          <p style="color: #666; margin: 10px 0 0 0;">새로운 주역 관련 논문이 등록되었습니다!</p>
        </div>
        
        <div style="margin-bottom: 30px;">
          <h2 style="color: #333; border-bottom: 2px solid #4CAF50; padding-bottom: 10px;">
            🆕 새로 등록된 논문 (${papers.length}편)
          </h2>
          ${papersList}
        </div>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin-top: 30px;">
          <h3 style="color: #333; margin: 0 0 15px 0;">📌 이용 안내</h3>
          <ul style="color: #666; margin: 0; padding-left: 20px;">
            <li>이 알림은 RISS에서 '주역' 키워드로 새로 등록된 논문을 자동으로 감지하여 발송됩니다.</li>
            <li>논문 제목을 클릭하면 RISS 원문 페이지로 이동합니다.</li>
            <li>더 이상 알림을 받고 싶지 않으시면 하단의 구독 취소 링크를 클릭해 주세요.</li>
          </ul>
        </div>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="color: #999; font-size: 12px; margin: 0;">
            이 이메일은 RISS 주역 논문 알림 서비스에서 자동으로 발송되었습니다.<br>
            <a href="mailto:${process.env.SMTP_USER}" style="color: #666;">문의사항</a> | 
            <a href="#unsubscribe" style="color: #666;">구독 취소</a>
          </p>
        </div>
        
      </div>
    </body>
    </html>
  `;
}

// Generate plain text email
function generateEmailText(papers) {
  const papersList = papers.map(paper => `
📄 ${paper.title}
   저자: ${paper.author || '정보 없음'}
   발행년도: ${paper.publicationYear || '정보 없음'}
   링크: ${paper.url}
  `).join('\n');

  return `
📚 RISS 주역 논문 알림

새로운 주역 관련 논문이 ${papers.length}편 등록되었습니다!

${papersList}

이 알림은 RISS에서 '주역' 키워드로 새로 등록된 논문을 자동으로 감지하여 발송됩니다.
더 이상 알림을 받고 싶지 않으시면 ${process.env.SMTP_USER}로 연락해 주세요.

RISS 주역 논문 알림 서비스
  `;
}

// Send notification to a single email
async function sendEmailNotification(transporter, email, papers) {
  const mailOptions = {
    from: `"RISS 논문 알림" <${process.env.SMTP_USER}>`,
    to: email,
    subject: `🔔 새로운 주역 논문 ${papers.length}편이 등록되었습니다`,
    text: generateEmailText(papers),
    html: generateEmailHTML(papers)
  };

  try {
    if (transporter) {
      const info = await transporter.sendMail(mailOptions);
      console.log(`✅ Email sent to ${email}: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } else {
      // Log notification when SMTP is not configured
      console.log(`📧 [DEMO] Email notification to ${email}:`);
      console.log(`Subject: ${mailOptions.subject}`);
      console.log(`Papers: ${papers.map(p => p.title).join(', ')}`);
      return { success: true, messageId: 'demo-mode' };
    }
  } catch (error) {
    console.error(`❌ Failed to send email to ${email}:`, error);
    return { success: false, error: error.message };
  }
}

// Get active email subscribers
async function getActiveEmails() {
  return new Promise((resolve, reject) => {
    const db = getDatabase();
    
    db.all(
      'SELECT email FROM emails WHERE is_active = 1',
      [],
      (err, rows) => {
        if (err) {
          console.error('Database error:', err);
          db.close();
          reject(err);
          return;
        }
        
        const emails = rows.map(row => row.email);
        db.close();
        resolve(emails);
      }
    );
  });
}

// Log notification to database
async function logNotification(paperId, email, status) {
  return new Promise((resolve) => {
    const db = getDatabase();
    
    db.run(
      'INSERT INTO notification_logs (paper_id, email, status) VALUES (?, ?, ?)',
      [paperId, email, status],
      (err) => {
        if (err) {
          console.error('Failed to log notification:', err);
        }
        db.close();
        resolve();
      }
    );
  });
}

// Main notification function
async function sendNotifications(newPapers) {
  if (!newPapers || newPapers.length === 0) {
    console.log('📭 No new papers to notify about');
    return;
  }

  try {
    console.log(`📬 Preparing to send notifications for ${newPapers.length} new papers...`);
    
    // Get active email subscribers
    const emails = await getActiveEmails();
    
    if (emails.length === 0) {
      console.log('📭 No active email subscribers found');
      return;
    }

    console.log(`📧 Found ${emails.length} active subscribers`);
    
    // Create email transporter
    const transporter = createTransporter();
    
    // Send notifications to all subscribers
    const notifications = await Promise.allSettled(
      emails.map(email => sendEmailNotification(transporter, email, newPapers))
    );

    // Log results
    let successCount = 0;
    let failureCount = 0;

    notifications.forEach((result, index) => {
      const email = emails[index];
      if (result.status === 'fulfilled' && result.value.success) {
        successCount++;
        // Log each paper notification
        newPapers.forEach(paper => {
          logNotification(paper.id, email, 'sent');
        });
      } else {
        failureCount++;
        console.error(`Failed to send to ${email}:`, result.reason || result.value?.error);
        // Log failure
        newPapers.forEach(paper => {
          logNotification(paper.id, email, 'failed');
        });
      }
    });

    // Mark papers as notified
    await markPapersAsNotified(newPapers);

    console.log(`📊 Notification summary: ${successCount} sent, ${failureCount} failed`);
    
    return {
      total: emails.length,
      success: successCount,
      failed: failureCount,
      papers: newPapers.length
    };

  } catch (error) {
    console.error('❌ Notification process failed:', error);
    throw error;
  }
}

// Mark papers as notified in database
async function markPapersAsNotified(papers) {
  return new Promise((resolve) => {
    const db = getDatabase();
    const paperIds = papers.map(p => p.id).join(',');
    
    db.run(
      `UPDATE papers SET notified = 1 WHERE id IN (${paperIds})`,
      [],
      (err) => {
        if (err) {
          console.error('Failed to mark papers as notified:', err);
        } else {
          console.log('✅ Papers marked as notified');
        }
        db.close();
        resolve();
      }
    );
  });
}

module.exports = {
  sendNotifications,
  sendEmailNotification,
  getActiveEmails
};