#!/usr/bin/env node

/**
 * Manual RISS Crawler Script
 * 
 * This script can be run independently to test the crawler functionality
 * Usage: node scripts/crawler.js
 */

require('dotenv').config({ path: '../.env' });
const { runSingleCrawl } = require('../services/crawler');
const { initDatabase } = require('../config/database');

async function main() {
  console.log('🚀 Starting manual RISS crawler...');
  console.log('Search keyword:', process.env.SEARCH_KEYWORD || '주역');
  
  try {
    // Initialize database
    console.log('📊 Initializing database...');
    await initDatabase();
    console.log('✅ Database initialized');
    
    // Run crawler
    console.log('🔍 Starting crawl...');
    const result = await runSingleCrawl();
    
    console.log('\n📋 Crawl Results:');
    console.log(`   Total papers found: ${result.totalFound}`);
    console.log(`   New papers added: ${result.newPapers}`);
    
    if (result.newPapers > 0) {
      console.log('📧 New papers found! Email notifications will be sent to subscribers.');
    } else {
      console.log('📭 No new papers found.');
    }
    
  } catch (error) {
    console.error('❌ Crawl failed:', error.message);
    process.exit(1);
  }
  
  console.log('✅ Crawl completed successfully');
  process.exit(0);
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Received SIGINT, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
  process.exit(0);
});

// Run the script
main().catch(error => {
  console.error('❌ Script failed:', error);
  process.exit(1);
});