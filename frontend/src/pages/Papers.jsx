import React, { useState, useEffect } from 'react'
import { Search, ExternalLink, Calendar, User, FileText, Loader2, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../services/api'

const Papers = () => {
  const [papers, setPapers] = useState([])
  const [filteredPapers, setFilteredPapers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('all') // 'all', 'recent', 'this-week'

  useEffect(() => {
    fetchPapers()
  }, [])

  useEffect(() => {
    filterPapers()
  }, [papers, searchTerm, selectedFilter])

  const fetchPapers = async () => {
    try {
      setLoading(true)
      const response = await api.get('/papers?limit=100')
      setPapers(response.data.data || [])
    } catch (error) {
      console.error('Failed to fetch papers:', error)
      toast.error('논문 목록을 불러오는데 실패했습니다')
    } finally {
      setLoading(false)
    }
  }

  const filterPapers = () => {
    let filtered = [...papers]

    // Apply search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(paper => 
        paper.title.toLowerCase().includes(term) ||
        (paper.author && paper.author.toLowerCase().includes(term)) ||
        (paper.abstract && paper.abstract.toLowerCase().includes(term))
      )
    }

    // Apply time filter
    if (selectedFilter === 'recent') {
      const oneWeekAgo = new Date()
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
      
      filtered = filtered.filter(paper => {
        const discoveredDate = new Date(paper.discovered_at)
        return discoveredDate >= oneWeekAgo
      })
    } else if (selectedFilter === 'this-week') {
      const oneWeekAgo = new Date()
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
      
      filtered = filtered.filter(paper => {
        const discoveredDate = new Date(paper.discovered_at)
        return discoveredDate >= oneWeekAgo
      })
    }

    setFilteredPapers(filtered)
  }

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    } catch {
      return dateString
    }
  }

  const getTimeAgo = (dateString) => {
    try {
      const date = new Date(dateString)
      const now = new Date()
      const diffInHours = Math.floor((now - date) / (1000 * 60 * 60))
      
      if (diffInHours < 1) return '방금 전'
      if (diffInHours < 24) return `${diffInHours}시간 전`
      
      const diffInDays = Math.floor(diffInHours / 24)
      if (diffInDays < 7) return `${diffInDays}일 전`
      
      const diffInWeeks = Math.floor(diffInDays / 7)
      if (diffInWeeks < 4) return `${diffInWeeks}주 전`
      
      const diffInMonths = Math.floor(diffInDays / 30)
      return `${diffInMonths}개월 전`
    } catch {
      return ''
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary-600" />
          <p className="text-gray-600">논문 목록을 불러오는 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">📚 발견된 논문</h1>
          <p className="text-gray-600 mt-2">
            RISS에서 발견된 주역 관련 논문들을 확인해보세요
          </p>
        </div>
        <button
          onClick={fetchPapers}
          disabled={loading}
          className="btn-secondary mt-4 sm:mt-0 flex items-center space-x-2"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>새로고침</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="card">
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="논문 제목, 저자, 내용으로 검색..."
              className="input-field pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedFilter === 'all'
                  ? 'bg-primary-100 text-primary-700 border border-primary-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              전체 ({papers.length})
            </button>
            <button
              onClick={() => setSelectedFilter('recent')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedFilter === 'recent'
                  ? 'bg-primary-100 text-primary-700 border border-primary-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              최근 1주일
            </button>
          </div>

          {/* Results count */}
          <div className="text-sm text-gray-600">
            총 {filteredPapers.length}개의 논문을 찾았습니다
          </div>
        </div>
      </div>

      {/* Papers List */}
      {filteredPapers.length === 0 ? (
        <div className="card text-center py-12">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">논문을 찾을 수 없습니다</h3>
          <p className="text-gray-600">
            {searchTerm ? '검색 조건을 변경해보세요' : '아직 발견된 논문이 없습니다'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPapers.map((paper) => (
            <div key={paper.id} className="paper-card">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 leading-6">
                    {paper.title}
                  </h3>
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
                    {paper.author && (
                      <div className="flex items-center space-x-1">
                        <User className="w-4 h-4" />
                        <span>{paper.author}</span>
                      </div>
                    )}
                    {paper.publication_date && (
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{paper.publication_date}</span>
                      </div>
                    )}
                    <div className="text-gray-500">
                      발견: {getTimeAgo(paper.discovered_at)}
                    </div>
                  </div>

                  {paper.abstract && (
                    <p className="text-gray-700 text-sm leading-relaxed mb-4">
                      {paper.abstract.length > 200 
                        ? `${paper.abstract.substring(0, 200)}...` 
                        : paper.abstract
                      }
                    </p>
                  )}

                  {paper.keywords && paper.keywords !== '주역' && (
                    <div className="mb-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                        {paper.keywords}
                      </span>
                    </div>
                  )}
                </div>

                <div className="ml-4 flex-shrink-0">
                  <a
                    href={paper.riss_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
                  >
                    <span>논문 보기</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>

              {/* Status indicator */}
              <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                <div className="text-xs text-gray-500">
                  논문 ID: {paper.riss_id || paper.id}
                </div>
                {paper.is_notified && (
                  <div className="flex items-center space-x-1 text-xs text-green-600">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span>알림 발송됨</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Papers