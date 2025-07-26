const express = require('express');
const router = express.Router();
const { getAllPapers, getNotificationStats } = require('../config/database');

// Get all discovered papers
router.get('/', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const papers = await getAllPapers(limit);
    
    res.json({
      success: true,
      data: papers.map(paper => ({
        id: paper.id,
        title: paper.title,
        author: paper.author,
        publication_date: paper.publication_date,
        riss_url: paper.riss_url,
        abstract: paper.abstract,
        keywords: paper.keywords,
        discovered_at: paper.discovered_at,
        is_notified: !!paper.is_notified
      })),
      count: papers.length
    });

  } catch (error) {
    console.error('Get papers error:', error);
    res.status(500).json({
      error: '서버 오류가 발생했습니다.'
    });
  }
});

// Get recent papers (last 7 days)
router.get('/recent', async (req, res) => {
  try {
    const papers = await getAllPapers(100);
    
    // Filter papers from last 7 days
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const recentPapers = papers.filter(paper => {
      const discoveredDate = new Date(paper.discovered_at);
      return discoveredDate >= oneWeekAgo;
    });
    
    res.json({
      success: true,
      data: recentPapers.map(paper => ({
        id: paper.id,
        title: paper.title,
        author: paper.author,
        publication_date: paper.publication_date,
        riss_url: paper.riss_url,
        abstract: paper.abstract,
        keywords: paper.keywords,
        discovered_at: paper.discovered_at,
        is_notified: !!paper.is_notified
      })),
      count: recentPapers.length
    });

  } catch (error) {
    console.error('Get recent papers error:', error);
    res.status(500).json({
      error: '서버 오류가 발생했습니다.'
    });
  }
});

// Get system statistics
router.get('/stats', async (req, res) => {
  try {
    const stats = await getNotificationStats();
    const allPapers = await getAllPapers(1000);
    
    // Calculate additional stats
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const recentPapers = allPapers.filter(paper => {
      const discoveredDate = new Date(paper.discovered_at);
      return discoveredDate >= oneWeekAgo;
    });

    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    
    const monthlyPapers = allPapers.filter(paper => {
      const discoveredDate = new Date(paper.discovered_at);
      return discoveredDate >= oneMonthAgo;
    });
    
    res.json({
      success: true,
      data: {
        total_subscribers: stats.total_subscribers || 0,
        total_papers: allPapers.length,
        total_notifications: stats.total_notifications || 0,
        papers_this_week: recentPapers.length,
        papers_this_month: monthlyPapers.length,
        last_updated: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      error: '서버 오류가 발생했습니다.'
    });
  }
});

// Get a specific paper by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const papers = await getAllPapers(1000);
    const paper = papers.find(p => p.id === parseInt(id));
    
    if (!paper) {
      return res.status(404).json({
        error: '논문을 찾을 수 없습니다.'
      });
    }
    
    res.json({
      success: true,
      data: {
        id: paper.id,
        title: paper.title,
        author: paper.author,
        publication_date: paper.publication_date,
        riss_url: paper.riss_url,
        abstract: paper.abstract,
        keywords: paper.keywords,
        discovered_at: paper.discovered_at,
        is_notified: !!paper.is_notified
      }
    });

  } catch (error) {
    console.error('Get paper error:', error);
    res.status(500).json({
      error: '서버 오류가 발생했습니다.'
    });
  }
});

module.exports = router;