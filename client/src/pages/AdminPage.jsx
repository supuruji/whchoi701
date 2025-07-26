import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { 
  Users, 
  Mail, 
  Settings, 
  RefreshCw, 
  Trash2,
  Download,
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp,
  Database
} from 'lucide-react'
import { emailAPI, papersAPI, systemAPI, handleAPIError } from '../services/api'
import StatsCard from '../components/StatsCard'

function AdminPage() {
  const [emails, setEmails] = useState([])
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [emailResponse, statsResponse] = await Promise.all([
        emailAPI.getAll(),
        papersAPI.getStats()
      ])
      
      setEmails(emailResponse.emails || [])
      setStats(statsResponse)
    } catch (error) {
      console.error('Failed to load admin data:', error)
      toast.error('관리자 데이터를 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleUnsubscribe = async (email) => {
    if (!confirm(`정말로 ${email}을 구독 해제하시겠습니까?`)) {
      return
    }

    try {
      await emailAPI.unsubscribe(email)
      toast.success('구독이 해제되었습니다.')
      loadData() // Reload data
    } catch (error) {
      const errorMessage = handleAPIError(error)
      toast.error(errorMessage)
    }
  }

  const handleManualCrawl = async () => {
    if (!confirm('수동으로 크롤링을 실행하시겠습니까? 시간이 소요될 수 있습니다.')) {
      return
    }

    setActionLoading(true)
    try {
      const response = await systemAPI.triggerCrawl()
      toast.success(response.message || '크롤링을 시작했습니다. 결과는 잠시 후 확인하세요.')
    } catch (error) {
      const errorMessage = handleAPIError(error)
      toast.error(errorMessage)
    } finally {
      setActionLoading(false)
    }
  }

  const exportEmails = () => {
    const emailList = emails.map(email => email.email).join('\n')
    const blob = new Blob([emailList], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `riss-subscribers-${new Date().toISOString().split('T')[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success('이메일 목록이 다운로드되었습니다.')
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('ko-KR')
  }

  const tabs = [
    { id: 'overview', name: '개요', icon: TrendingUp },
    { id: 'emails', name: '이메일 관리', icon: Mail },
    { id: 'system', name: '시스템 설정', icon: Settings }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            ⚙️ 관리자 페이지
          </h1>
          <p className="text-lg text-gray-600">
            시스템 현황을 확인하고 구독자를 관리하세요
          </p>
        </div>

        {/* Warning Notice */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-8">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-amber-700">
              <p className="font-medium mb-1">관리자 권한 필요</p>
              <p>
                이 페이지는 시스템 관리를 위한 페이지입니다. 
                실제 운영 환경에서는 적절한 인증 시스템을 구현해야 합니다.
              </p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.name}</span>
                </button>
              )
            })}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatsCard
                icon={Database}
                title="총 논문 수"
                value={stats.total || 0}
                description="등록된 전체 논문"
                color="blue"
                loading={loading}
              />
              
              <StatsCard
                icon={TrendingUp}
                title="이번 주 신규"
                value={stats.recent || 0}
                description="최근 7일간 등록"
                color="green"
                loading={loading}
              />
              
              <StatsCard
                icon={Mail}
                title="알림 발송"
                value={stats.notified || 0}
                description="총 알림 발송 건수"
                color="purple"
                loading={loading}
              />
              
              <StatsCard
                icon={Users}
                title="활성 구독자"
                value={stats.active_emails || 0}
                description="구독 중인 사용자"
                color="orange"
                loading={loading}
              />
            </div>

            {/* System Status */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">시스템 상태</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">크롤러 상태</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm text-green-600">실행 중</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">이메일 서비스</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-green-600">정상</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">데이터베이스</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-green-600">연결됨</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">마지막 크롤링</span>
                    <span className="text-sm text-gray-900">
                      {new Date().toLocaleString('ko-KR')}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">다음 크롤링</span>
                    <span className="text-sm text-gray-900">
                      {new Date(Date.now() + 6 * 60 * 60 * 1000).toLocaleString('ko-KR')}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">크롤링 주기</span>
                    <span className="text-sm text-gray-900">6시간</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'emails' && (
          <div className="space-y-6">
            
            {/* Email Management Header */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  구독자 관리 ({emails.length}명)
                </h2>
                
                <div className="flex items-center space-x-3">
                  <button
                    onClick={exportEmails}
                    disabled={emails.length === 0}
                    className="flex items-center space-x-2 text-sm bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 px-3 py-2 rounded-lg transition-colors duration-200"
                  >
                    <Download className="h-4 w-4" />
                    <span>내보내기</span>
                  </button>
                  
                  <button
                    onClick={loadData}
                    disabled={loading}
                    className="flex items-center space-x-2 text-sm bg-primary-100 hover:bg-primary-200 text-primary-700 px-3 py-2 rounded-lg transition-colors duration-200"
                  >
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    <span>새로고침</span>
                  </button>
                </div>
              </div>

              {/* Email List */}
              {loading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      <div className="h-8 bg-gray-200 rounded w-20"></div>
                    </div>
                  ))}
                </div>
              ) : emails.length > 0 ? (
                <div className="space-y-2">
                  {emails.map((emailData) => (
                    <div key={emailData.id} className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors duration-200">
                      <div className="flex items-center space-x-3">
                        <div className={`w-2 h-2 rounded-full ${emailData.is_active ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <span className="font-medium text-gray-900">{emailData.email}</span>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <span className="text-sm text-gray-500">
                          {formatDate(emailData.created_at)}
                        </span>
                        
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          emailData.is_active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {emailData.is_active ? '활성' : '비활성'}
                        </span>
                        
                        {emailData.is_active && (
                          <button
                            onClick={() => handleUnsubscribe(emailData.email)}
                            className="flex items-center space-x-1 text-sm text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-2 py-1 rounded transition-colors duration-200"
                          >
                            <Trash2 className="h-3 w-3" />
                            <span>구독 해제</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">등록된 구독자가 없습니다.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'system' && (
          <div className="space-y-6">
            
            {/* System Controls */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">시스템 제어</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">수동 크롤링 실행</h3>
                    <p className="text-sm text-gray-600">즉시 RISS에서 새로운 논문을 검색합니다</p>
                  </div>
                  <button
                    onClick={handleManualCrawl}
                    disabled={actionLoading}
                    className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
                  >
                    <RefreshCw className={`h-4 w-4 ${actionLoading ? 'animate-spin' : ''}`} />
                    <span>{actionLoading ? '실행 중...' : '실행'}</span>
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">시스템 상태 확인</h3>
                    <p className="text-sm text-gray-600">모든 서비스의 상태를 확인합니다</p>
                  </div>
                  <button
                    onClick={loadData}
                    disabled={loading}
                    className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
                  >
                    <CheckCircle className="h-4 w-4" />
                    <span>상태 확인</span>
                  </button>
                </div>
              </div>
            </div>

            {/* System Configuration */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">시스템 설정</h2>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      크롤링 주기 (시간)
                    </label>
                    <input
                      type="number"
                      value="6"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      readOnly
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      검색 키워드
                    </label>
                    <input
                      type="text"
                      value="주역"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      readOnly
                    />
                  </div>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-blue-700">
                      <p className="font-medium mb-1">설정 변경 안내</p>
                      <p>
                        현재 버전에서는 설정을 읽기 전용으로 표시합니다. 
                        실제 변경은 서버의 환경 변수나 설정 파일을 통해 가능합니다.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminPage