const puppeteer = require('puppeteer');
const cron = require('node-cron');
const { getDatabase } = require('../database/init');
const { sendNotifications } = require('./emailService');

// RISS search URL for '주역' keyword
const RISS_SEARCH_URL = 'http://www.riss.kr/search/Search.do?isDetailSearch=N&searchGubun=true&viewYn=OP&queryText=%EC%A3%BC%EC%97%AD&strQuery=%EC%A3%BC%EC%97%AD&exQuery=&exQueryText=&order=%2FDESC&onHanja=false&strSort=RANK&p_year1=&p_year2=&iStartCount=0&orderBy=&mat_type=&mat_subtype=&fulltext_kind=&t_gubun=&learning_type=&ccl_code=&inside_outside=&fric_yn=&image_yn=&gubun=&kdc=&toc=&pm=&pg=&tot=&listUrl=&uci_yn=&selectedDb=';

// Main crawler function
async function crawlRissPapers() {
  console.log('🔍 Starting RISS crawler...');
  
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ]
    });

    const page = await browser.newPage();
    
    // Set user agent to avoid blocking
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    // Navigate to RISS search results
    console.log('📄 Navigating to RISS search results...');
    await page.goto(RISS_SEARCH_URL, { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });

    // Wait for results to load
    await page.waitForSelector('.srchResultListW', { timeout: 10000 });

    // Extract paper information
    const papers = await page.evaluate(() => {
      const results = [];
      const paperElements = document.querySelectorAll('.cont');
      
      paperElements.forEach((element, index) => {
        try {
          const titleElement = element.querySelector('.title a');
          const authorElement = element.querySelector('.author');
          const infoElement = element.querySelector('.etc');
          
          if (titleElement) {
            const title = titleElement.textContent.trim();
            const url = titleElement.href;
            const author = authorElement ? authorElement.textContent.trim() : '';
            
            // Extract publication year from info
            let publicationYear = '';
            if (infoElement) {
              const yearMatch = infoElement.textContent.match(/(\d{4})/);
              if (yearMatch) {
                publicationYear = yearMatch[1];
              }
            }
            
            // Generate RISS ID from URL
            const rissId = url ? url.split('=').pop() : `riss_${Date.now()}_${index}`;
            
            results.push({
              title,
              author,
              publicationYear,
              url,
              rissId
            });
          }
        } catch (error) {
          console.error('Error parsing paper element:', error);
        }
      });
      
      return results;
    });

    console.log(`📚 Found ${papers.length} papers from RISS`);

    // Process and save new papers
    const newPapers = await saveNewPapers(papers);
    
    if (newPapers.length > 0) {
      console.log(`🆕 ${newPapers.length} new papers detected`);
      await sendNotifications(newPapers);
    } else {
      console.log('📋 No new papers found');
    }

    return {
      totalFound: papers.length,
      newPapers: newPapers.length,
      papers: newPapers
    };

  } catch (error) {
    console.error('❌ Crawler error:', error);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Save new papers to database
async function saveNewPapers(papers) {
  return new Promise((resolve, reject) => {
    const db = getDatabase();
    const newPapers = [];
    let processed = 0;

    if (papers.length === 0) {
      db.close();
      return resolve(newPapers);
    }

    papers.forEach((paper) => {
      // Check if paper already exists
      db.get(
        'SELECT id FROM papers WHERE riss_id = ? OR title = ?',
        [paper.rissId, paper.title],
        (err, row) => {
          if (err) {
            console.error('Database check error:', err);
            processed++;
            if (processed === papers.length) {
              db.close();
              resolve(newPapers);
            }
            return;
          }

          if (!row) {
            // Insert new paper
            db.run(
              `INSERT INTO papers (title, author, publication_year, url, riss_id, keyword) 
               VALUES (?, ?, ?, ?, ?, ?)`,
              [paper.title, paper.author, paper.publicationYear, paper.url, paper.rissId, '주역'],
              function(err) {
                if (err) {
                  console.error('Insert paper error:', err);
                } else {
                  console.log(`✅ New paper saved: ${paper.title}`);
                  newPapers.push({
                    id: this.lastID,
                    ...paper
                  });
                }
                
                processed++;
                if (processed === papers.length) {
                  db.close();
                  resolve(newPapers);
                }
              }
            );
          } else {
            processed++;
            if (processed === papers.length) {
              db.close();
              resolve(newPapers);
            }
          }
        }
      );
    });
  });
}

// Start crawler schedule (runs every 6 hours)
function startCrawlerSchedule() {
  // Run immediately on startup
  setTimeout(crawlRissPapers, 5000);
  
  // Schedule to run every 6 hours
  cron.schedule('0 */6 * * *', () => {
    console.log('⏰ Scheduled crawler execution starting...');
    crawlRissPapers().catch(error => {
      console.error('Scheduled crawler failed:', error);
    });
  });
  
  console.log('📅 Crawler scheduled to run every 6 hours');
}

// Manual crawler trigger
async function runCrawlerManually() {
  try {
    const result = await crawlRissPapers();
    return result;
  } catch (error) {
    console.error('Manual crawler error:', error);
    throw error;
  }
}

module.exports = {
  crawlRissPapers,
  startCrawlerSchedule,
  runCrawlerManually
};