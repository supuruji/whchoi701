import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { 
  Search, 
  Filter, 
  BookOpen, 
  ChevronLeft, 
  ChevronRight,
  RefreshCw,
  Calendar,
  SortAsc,
  SortDesc
} from 'lucide-react'
import { papersAPI, handleAPIError } from '../services/api'
import PaperCard from '../components/PaperCard'

function PapersPage() {
  const [papers, setPapers] = useState([])
  const [pagination, setPagination] = useState({})
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(12)
  const [sortOrder, setSortOrder] = useState('desc')

  useEffect(() => {
    loadPapers()
  }, [currentPage, itemsPerPage, sortOrder])

  const loadPapers = async () => {
    setLoading(true)
    try {
      const response = await papersAPI.getAll(currentPage, itemsPerPage)
      setPapers(response.papers || [])
      setPagination(response.pagination || {})
    } catch (error) {
      console.error('Failed to load papers:', error)
      toast.error('논문 목록을 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!searchQuery.trim()) {
      loadPapers()
      return
    }

    setLoading(true)
    try {
      const response = await papersAPI.search(searchQuery)
      setPapers(response.papers || [])
      setPagination({}) // Clear pagination for search results
      toast.success(`${response.count || 0}개의 논문을 찾았습니다.`)
    } catch (error) {
      console.error('Search failed:', error)
      toast.error('검색에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = () => {
    setSearchQuery('')
    setCurrentPage(1)
    loadPapers()
    toast.success('목록을 새로고침했습니다.')
  }

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            📚 주역 논문 목록
          </h1>
          <p className="text-lg text-gray-600">
            RISS에서 수집된 주역 관련 논문들을 확인하세요
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <form onSubmit={handleSearch} className="space-y-4">
            
            {/* Search Bar */}
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="논문 제목이나 저자로 검색..."
                  className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2"
              >
                <Search className="h-4 w-4" />
                <span>검색</span>
              </button>
            </div>

            {/* Filter Controls */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              
              {/* Left side - Sort and View options */}
              <div className="flex items-center space-x-4">
                <button
                  type="button"
                  onClick={toggleSortOrder}
                  className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900 transition-colors duration-200"
                >
                  {sortOrder === 'desc' ? (
                    <SortDesc className="h-4 w-4" />
                  ) : (
                    <SortAsc className="h-4 w-4" />
                  )}
                  <span>{sortOrder === 'desc' ? '최신순' : '오래된순'}</span>
                </button>

                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <span>페이지당:</span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value))
                      setCurrentPage(1)
                    }}
                    className="border border-gray-300 rounded px-2 py-1 text-sm"
                  >
                    <option value={6}>6개</option>
                    <option value={12}>12개</option>
                    <option value={24}>24개</option>
                    <option value={48}>48개</option>
                  </select>
                </div>
              </div>

              {/* Right side - Actions */}
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={handleRefresh}
                  disabled={loading}
                  className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg transition-all duration-200"
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  <span>새로고침</span>
                </button>

                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('')
                      loadPapers()
                    }}
                    className="text-sm text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-2 rounded-lg transition-all duration-200"
                  >
                    검색 해제
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>

        {/* Results Info */}
        {!loading && (
          <div className="flex items-center justify-between mb-6">
            <div className="text-sm text-gray-600">
              {searchQuery ? (
                <span>
                  "<strong>{searchQuery}</strong>" 검색 결과: <strong>{papers.length}</strong>개
                </span>
              ) : (
                <span>
                  전체 <strong>{pagination.total_items || 0}</strong>개 논문 중{' '}
                  <strong>{((currentPage - 1) * itemsPerPage) + 1}</strong>-
                  <strong>{Math.min(currentPage * itemsPerPage, pagination.total_items || 0)}</strong>개
                </span>
              )}
            </div>
            
            <div className="flex items-center text-sm text-gray-500">
              <Calendar className="h-4 w-4 mr-1" />
              <span>마지막 업데이트: {new Date().toLocaleDateString('ko-KR')}</span>
            </div>
          </div>
        )}

        {/* Papers Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(itemsPerPage)].map((_, index) => (
              <div key={index} className="bg-white rounded-lg p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : papers.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {papers.map((paper) => (
                <PaperCard key={paper.id} paper={paper} />
              ))}
            </div>

            {/* Pagination */}
            {!searchQuery && pagination.total_pages > 1 && (
              <div className="flex items-center justify-center space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage <= 1}
                  className="flex items-center space-x-1 px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors duration-200"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>이전</span>
                </button>

                <div className="flex space-x-1">
                  {[...Array(Math.min(pagination.total_pages, 10))].map((_, index) => {
                    const pageNum = index + 1
                    const isActive = pageNum === currentPage
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-3 py-2 rounded-lg font-medium transition-colors duration-200 ${
                          isActive
                            ? 'bg-primary-600 text-white'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {pageNum}
                      </button>
                    )
                  })}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= pagination.total_pages}
                  className="flex items-center space-x-1 px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors duration-200"
                >
                  <span>다음</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchQuery ? '검색 결과가 없습니다' : '등록된 논문이 없습니다'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchQuery 
                ? '다른 검색어로 시도해보세요.'
                : '크롤러가 새로운 논문을 찾고 있습니다. 잠시 후 다시 확인해주세요.'
              }
            </p>
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('')
                  loadPapers()
                }}
                className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
              >
                전체 목록 보기
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default PapersPage