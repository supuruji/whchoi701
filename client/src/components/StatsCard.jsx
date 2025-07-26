import { TrendingUp } from 'lucide-react'

function StatsCard({ icon: Icon, title, value, description, color = 'blue', loading = false }) {
  const colorClasses = {
    blue: {
      bg: 'bg-blue-100',
      icon: 'text-blue-600',
      value: 'text-blue-600'
    },
    green: {
      bg: 'bg-green-100',
      icon: 'text-green-600',
      value: 'text-green-600'
    },
    purple: {
      bg: 'bg-purple-100',
      icon: 'text-purple-600',
      value: 'text-purple-600'
    },
    orange: {
      bg: 'bg-orange-100',
      icon: 'text-orange-600',
      value: 'text-orange-600'
    },
    red: {
      bg: 'bg-red-100',
      icon: 'text-red-600',
      value: 'text-red-600'
    }
  }

  const colors = colorClasses[color] || colorClasses.blue

  const formatNumber = (num) => {
    if (num === undefined || num === null) return '0'
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div className={`w-12 h-12 ${colors.bg} rounded-lg`}></div>
          <div className="w-8 h-4 bg-gray-200 rounded"></div>
        </div>
        <div className="w-16 h-8 bg-gray-200 rounded mb-2"></div>
        <div className="w-24 h-4 bg-gray-200 rounded"></div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-200 p-6 group">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className={`inline-flex items-center justify-center w-12 h-12 ${colors.bg} rounded-lg group-hover:scale-105 transition-transform duration-200`}>
          <Icon className={`h-6 w-6 ${colors.icon}`} />
        </div>
        
        <div className="flex items-center text-gray-400">
          <TrendingUp className="h-4 w-4" />
        </div>
      </div>

      {/* Content */}
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-1">
          <span className={`${colors.value} transition-colors duration-200`}>
            {formatNumber(value)}
          </span>
        </h3>
        
        <p className="text-sm font-medium text-gray-900 mb-1">
          {title}
        </p>
        
        <p className="text-xs text-gray-500">
          {description}
        </p>
      </div>

      {/* Optional trend indicator */}
      {value > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center text-xs text-gray-500">
            <div className={`w-2 h-2 ${colors.bg} rounded-full mr-2`}></div>
            <span>실시간 업데이트</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default StatsCard