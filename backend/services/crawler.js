const puppeteer = require('puppeteer');
const cron = require('node-cron');
const { addPaper, paperExists, getNewPapers, markPaperAsNotified } = require('../config/database');
const { sendNotificationEmails } = require('./emailService');

class RissCrawler {
  constructor() {
    this.browser = null;
    this.isRunning = false;
    this.searchKeyword = process.env.SEARCH_KEYWORD || '주역';
    this.baseUrl = 'https://www.riss.kr';
  }

  async initBrowser() {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--single-process',
          '--disable-gpu'
        ]
      });
    }
  }

  async closeBrowser() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  async searchRiss() {
    console.log(`Starting RISS crawl for keyword: ${this.searchKeyword}`);
    
    try {
      await this.initBrowser();
      const page = await this.browser.newPage();
      
      // Set user agent to avoid detection
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
      
      // Navigate to RISS search page
      const searchUrl = `${this.baseUrl}/search/Search.do?isDetailSearch=N&searchGubun=true&viewYn=OP&queryText=${encodeURIComponent(this.searchKeyword)}&strQuery=${encodeURIComponent(this.searchKeyword)}&exQuery=&exQueryText=&order=%2FDESC&onHanja=false&strSort=RANK&p_year1=&p_year2=&iStartCount=0&orderBy=&mat_type=&mat_subtype=&fulltext_kind=&t_gubun=&learning_type=&ccl_code=&inside_outside=&fric_yn=&image_yn=&gubun=&kdc=&toc_yn=&fsearchMethod=search&sflag=1&isFDetailSearch=N&pageNumber=1&resultKeyword=${encodeURIComponent(this.searchKeyword)}&fsearchSort=&fsearchOrder=&limiterList=&limiterListText=&facetList=&facetListText=&fsearchDB=&icate=re_a_kor&colName=re_a_kor&pageScale=10`;
      
      console.log('Navigating to RISS search...');
      await page.goto(searchUrl, { waitUntil: 'networkidle0', timeout: 30000 });
      
      // Wait for search results to load
      await page.waitForSelector('.srchResultListW', { timeout: 10000 });
      
      // Extract paper information
      const papers = await page.evaluate(() => {
        const items = document.querySelectorAll('.srchResultListW .cont');
        const results = [];
        
        items.forEach((item, index) => {
          try {
            const titleElement = item.querySelector('.title a');
            const authorElement = item.querySelector('.author');
            const pubInfoElement = item.querySelector('.etc');
            
            if (titleElement) {
              const title = titleElement.textContent.trim();
              const rissUrl = titleElement.href;
              
              // Extract RISS ID from URL
              const urlMatch = rissUrl.match(/control_no=([^&]+)/);
              const rissId = urlMatch ? urlMatch[1] : `riss_${Date.now()}_${index}`;
              
              const author = authorElement ? authorElement.textContent.trim() : '';
              const pubInfo = pubInfoElement ? pubInfoElement.textContent.trim() : '';
              
              // Try to extract publication date from pubInfo
              const dateMatch = pubInfo.match(/(\d{4})/);
              const publicationDate = dateMatch ? dateMatch[1] : '';
              
              results.push({
                title,
                author,
                publication_date: publicationDate,
                riss_url: rissUrl.startsWith('http') ? rissUrl : `https://www.riss.kr${rissUrl}`,
                riss_id: rissId,
                abstract: '', // Will be filled by detailed crawl if needed
                keywords: this.searchKeyword
              });
            }
          } catch (error) {
            console.error('Error parsing search result item:', error);
          }
        });
        
        return results;
      });
      
      console.log(`Found ${papers.length} papers in search results`);
      
      // Process each paper
      let newPapersCount = 0;
      for (const paper of papers) {
        try {
          // Check if paper already exists
          const exists = await paperExists(paper.riss_id);
          if (!exists) {
            await addPaper(paper);
            newPapersCount++;
            console.log(`Added new paper: ${paper.title}`);
          }
        } catch (error) {
          console.error(`Error adding paper ${paper.title}:`, error);
        }
      }
      
      await page.close();
      console.log(`Crawl completed. ${newPapersCount} new papers added.`);
      
      // Send notifications for new papers
      if (newPapersCount > 0) {
        await this.sendNotifications();
      }
      
      return {
        totalFound: papers.length,
        newPapers: newPapersCount
      };
      
    } catch (error) {
      console.error('Error during RISS crawl:', error);
      throw error;
    }
  }

  async sendNotifications() {
    try {
      console.log('Checking for new papers to notify...');
      const newPapers = await getNewPapers();
      
      if (newPapers.length > 0) {
        console.log(`Sending notifications for ${newPapers.length} new papers`);
        await sendNotificationEmails(newPapers);
        
        // Mark papers as notified
        for (const paper of newPapers) {
          await markPaperAsNotified(paper.id);
        }
        
        console.log('Notifications sent successfully');
      } else {
        console.log('No new papers to notify');
      }
    } catch (error) {
      console.error('Error sending notifications:', error);
    }
  }

  async crawlSingle() {
    if (this.isRunning) {
      console.log('Crawl already in progress, skipping...');
      return;
    }

    this.isRunning = true;
    try {
      const result = await this.searchRiss();
      console.log('Crawl result:', result);
      return result;
    } catch (error) {
      console.error('Single crawl failed:', error);
      throw error;
    } finally {
      this.isRunning = false;
    }
  }

  startScheduledCrawl() {
    const cronPattern = process.env.CRAWLER_INTERVAL || '*/30 * * * *'; // Every 30 minutes by default
    
    console.log(`Starting scheduled RISS crawler with pattern: ${cronPattern}`);
    
    cron.schedule(cronPattern, async () => {
      console.log('Scheduled crawl starting...');
      try {
        await this.crawlSingle();
      } catch (error) {
        console.error('Scheduled crawl failed:', error);
      }
    });
    
    // Run initial crawl
    setTimeout(() => {
      this.crawlSingle().catch(console.error);
    }, 5000); // Wait 5 seconds after startup
  }

  async stop() {
    await this.closeBrowser();
    this.isRunning = false;
  }
}

// Create singleton instance
const crawler = new RissCrawler();

// Export functions for use in other modules
const startCrawler = () => {
  crawler.startScheduledCrawl();
};

const runSingleCrawl = async () => {
  return await crawler.crawlSingle();
};

const stopCrawler = async () => {
  await crawler.stop();
};

module.exports = {
  startCrawler,
  runSingleCrawl,
  stopCrawler
};