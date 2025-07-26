const nodemailer = require('nodemailer');
const { getAllEmails, addNotification } = require('../config/database');

class EmailService {
  constructor() {
    this.transporter = null;
    this.isConfigured = false;
    this.initTransporter();
  }

  initTransporter() {
    try {
      // Check if email configuration is available
      if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
        console.warn('Email configuration not found. Email notifications will be disabled.');
        return;
      }

      this.transporter = nodemailer.createTransporter({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD, // Use app password for Gmail
        },
      });

      this.isConfigured = true;
      console.log('Email service configured successfully');

      // Verify SMTP connection
      this.transporter.verify((error, success) => {
        if (error) {
          console.error('SMTP verification failed:', error);
          this.isConfigured = false;
        } else {
          console.log('SMTP server is ready to take our messages');
        }
      });

    } catch (error) {
      console.error('Failed to initialize email transporter:', error);
      this.isConfigured = false;
    }
  }

  generateEmailTemplate(papers) {
    const paperList = papers.map(paper => `
      <div style="margin-bottom: 20px; padding: 15px; border-left: 4px solid #007bff; background-color: #f8f9fa;">
        <h3 style="margin: 0 0 10px 0; color: #007bff;">
          <a href="${paper.riss_url}" style="text-decoration: none; color: #007bff;">${paper.title}</a>
        </h3>
        ${paper.author ? `<p style="margin: 5px 0; color: #6c757d;"><strong>저자:</strong> ${paper.author}</p>` : ''}
        ${paper.publication_date ? `<p style="margin: 5px 0; color: #6c757d;"><strong>발행년도:</strong> ${paper.publication_date}</p>` : ''}
        ${paper.abstract ? `<p style="margin: 10px 0; color: #495057;">${paper.abstract.substring(0, 200)}${paper.abstract.length > 200 ? '...' : ''}</p>` : ''}
        <p style="margin: 10px 0;">
          <a href="${paper.riss_url}" style="background-color: #007bff; color: white; padding: 8px 16px; text-decoration: none; border-radius: 4px; display: inline-block;">논문 보기</a>
        </p>
      </div>
    `).join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>RISS 주역 논문 알림</title>
      </head>
      <body style="font-family: 'Malgun Gothic', '맑은 고딕', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px; padding: 20px; background-color: #007bff; color: white; border-radius: 8px;">
          <h1 style="margin: 0; font-size: 24px;">📚 RISS 주역 논문 알림</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">새로운 주역 관련 논문이 발견되었습니다!</p>
        </div>

        <div style="margin-bottom: 20px;">
          <p style="font-size: 16px; margin-bottom: 20px;">
            안녕하세요! RISS에서 <strong>"주역"</strong>과 관련된 새로운 논문 <strong>${papers.length}편</strong>이 발견되어 알려드립니다.
          </p>
        </div>

        <div style="margin-bottom: 30px;">
          ${paperList}
        </div>

        <div style="border-top: 1px solid #dee2e6; padding-top: 20px; margin-top: 30px; text-align: center; font-size: 14px; color: #6c757d;">
          <p>이 알림은 RISS 주역 논문 모니터링 서비스에서 자동으로 발송됩니다.</p>
          <p>더 이상 알림을 받지 않으시려면 <a href="#" style="color: #007bff;">구독 해지</a>를 클릭하세요.</p>
          <p style="margin-top: 15px; font-size: 12px;">
            발송 시간: ${new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })}
          </p>
        </div>
      </body>
      </html>
    `;
  }

  generatePlainTextTemplate(papers) {
    const paperList = papers.map(paper => `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

제목: ${paper.title}
${paper.author ? `저자: ${paper.author}` : ''}
${paper.publication_date ? `발행년도: ${paper.publication_date}` : ''}
링크: ${paper.riss_url}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `).join('');

    return `
📚 RISS 주역 논문 알림

안녕하세요! RISS에서 "주역"과 관련된 새로운 논문 ${papers.length}편이 발견되어 알려드립니다.

${paperList}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

이 알림은 RISS 주역 논문 모니터링 서비스에서 자동으로 발송됩니다.
발송 시간: ${new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })}

더 이상 알림을 받지 않으시려면 웹사이트에서 구독을 해지하실 수 있습니다.
    `;
  }

  async sendNotificationEmails(papers) {
    if (!this.isConfigured) {
      console.log('Email service not configured. Skipping email notifications.');
      return { success: false, message: 'Email service not configured' };
    }

    if (!papers || papers.length === 0) {
      console.log('No papers to notify about.');
      return { success: true, message: 'No papers to notify' };
    }

    try {
      // Get all subscribed emails
      const subscribers = await getAllEmails();
      
      if (subscribers.length === 0) {
        console.log('No subscribers found.');
        return { success: true, message: 'No subscribers' };
      }

      console.log(`Sending notifications to ${subscribers.length} subscribers for ${papers.length} papers`);

      const htmlContent = this.generateEmailTemplate(papers);
      const textContent = this.generatePlainTextTemplate(papers);

      const results = [];

      // Send emails to all subscribers
      for (const subscriber of subscribers) {
        try {
          const mailOptions = {
            from: {
              name: 'RISS 논문 모니터',
              address: process.env.SMTP_USER
            },
            to: subscriber.email,
            subject: `📚 새로운 주역 논문 ${papers.length}편 발견!`,
            text: textContent,
            html: htmlContent,
          };

          const result = await this.transporter.sendMail(mailOptions);
          console.log(`Email sent successfully to ${subscriber.email}`);

          // Record notification in database
          for (const paper of papers) {
            try {
              await addNotification(subscriber.id, paper.id);
            } catch (notifError) {
              console.error(`Error recording notification for ${subscriber.email}:`, notifError);
            }
          }

          results.push({
            email: subscriber.email,
            success: true,
            messageId: result.messageId
          });

        } catch (emailError) {
          console.error(`Failed to send email to ${subscriber.email}:`, emailError);
          results.push({
            email: subscriber.email,
            success: false,
            error: emailError.message
          });
        }
      }

      const successCount = results.filter(r => r.success).length;
      const failureCount = results.filter(r => !r.success).length;

      console.log(`Email notifications completed: ${successCount} successful, ${failureCount} failed`);

      return {
        success: true,
        totalSubscribers: subscribers.length,
        successCount,
        failureCount,
        results
      };

    } catch (error) {
      console.error('Error sending notification emails:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async sendTestEmail(testEmail) {
    if (!this.isConfigured) {
      throw new Error('Email service not configured');
    }

    const testPapers = [{
      title: '주역의 현대적 해석과 응용 연구',
      author: '홍길동',
      publication_date: '2024',
      riss_url: 'https://www.riss.kr/test',
      abstract: '이 논문은 주역의 현대적 해석에 대한 연구입니다.'
    }];

    const mailOptions = {
      from: {
        name: 'RISS 논문 모니터',
        address: process.env.SMTP_USER
      },
      to: testEmail,
      subject: '📧 RISS 주역 논문 알림 테스트',
      text: this.generatePlainTextTemplate(testPapers),
      html: this.generateEmailTemplate(testPapers),
    };

    const result = await this.transporter.sendMail(mailOptions);
    return result;
  }
}

// Create singleton instance
const emailService = new EmailService();

module.exports = {
  sendNotificationEmails: (papers) => emailService.sendNotificationEmails(papers),
  sendTestEmail: (email) => emailService.sendTestEmail(email),
  isEmailConfigured: () => emailService.isConfigured
};