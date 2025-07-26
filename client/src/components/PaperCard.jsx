import { ExternalLink, User, Calendar, Tag } from 'lucide-react'

function PaperCard({ paper }) {
  const formatDate = (dateString) => {
    if (!dateString) return '날짜 정보 없음'
    try {
      return new Date(dateString).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    } catch {
      return dateString
    }
  }

  const handleCardClick = () => {
    if (paper.url) {
      window.open(paper.url, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 hover:border-primary-300 hover:shadow-lg transition-all duration-200 p-6 cursor-pointer group"
         onClick={handleCardClick}>
      
      {/* Paper Title */}
      <h3 className="font-semibold text-gray-900 text-lg leading-tight mb-3 group-hover:text-primary-600 transition-colors duration-200">
        {paper.title}
      </h3>

      {/* Paper Metadata */}
      <div className="space-y-2 mb-4">
        {paper.author && (
          <div className="flex items-center text-sm text-gray-600">
            <User className="h-4 w-4 mr-2 flex-shrink-0" />
            <span className="truncate">{paper.author}</span>
          </div>
        )}
        
        {paper.publication_year && (
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
            <span>{paper.publication_year}년</span>
          </div>
        )}
        
        <div className="flex items-center text-sm text-gray-600">
          <Tag className="h-4 w-4 mr-2 flex-shrink-0" />
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
            {paper.keyword || '주역'}
          </span>
        </div>
      </div>

      {/* Added Date */}
      <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
        <span>등록일: {formatDate(paper.created_at)}</span>
        {paper.notified && (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            알림 발송됨
          </span>
        )}
      </div>

      {/* Action Button */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">
          RISS에서 원문 보기
        </div>
        
        <div className="flex items-center text-primary-600 group-hover:text-primary-700 transition-colors duration-200">
          <span className="text-sm font-medium mr-1">논문 보기</span>
          <ExternalLink className="h-4 w-4" />
        </div>
      </div>
    </div>
  )
}

export default PaperCard