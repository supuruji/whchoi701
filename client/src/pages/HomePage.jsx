import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { 
  Mail, 
  BookOpen, 
  Bell, 
  TrendingUp, 
  Users, 
  Clock,
  CheckCircle,
  ArrowRight,
  Star
} from 'lucide-react'
import { emailAPI, papersAPI, handleAPIError } from '../services/api'
import EmailRegistrationForm from '../components/EmailRegistrationForm'
import PaperCard from '../components/PaperCard'
import StatsCard from '../components/StatsCard'

function HomePage() {
  const [recentPapers, setRecentPapers] = useState([])
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadInitialData()
  }, [])

  const loadInitialData = async () => {
    try {
      const [papersResponse, statsResponse] = await Promise.all([
        papersAPI.getRecent(),
        papersAPI.getStats()
      ])
      
      setRecentPapers(papersResponse.papers?.slice(0, 6) || [])
      setStats(statsResponse)
    } catch (error) {
      console.error('Failed to load initial data:', error)
      toast.error('데이터를 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-y-1 transform origin-top-left"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Hero Content */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
                <Star className="h-4 w-4 text-yellow-300" />
                <span className="text-sm font-medium">자동 논문 알림 서비스</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                📚 주역 논문을<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-300">
                  놓치지 마세요
                </span>
              </h1>
              
              <p className="text-xl text-blue-100 mb-8 leading-relaxed">
                RISS에 새로 등록되는 주역 관련 논문을<br />
                이메일로 자동 알림받고, 최신 연구 동향을 빠르게 파악하세요
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 items-center lg:items-start lg:justify-start justify-center">
                <div className="flex items-center space-x-2 text-blue-100">
                  <CheckCircle className="h-5 w-5 text-green-300" />
                  <span>무료 서비스</span>
                </div>
                <div className="flex items-center space-x-2 text-blue-100">
                  <CheckCircle className="h-5 w-5 text-green-300" />
                  <span>자동 알림</span>
                </div>
                <div className="flex items-center space-x-2 text-blue-100">
                  <CheckCircle className="h-5 w-5 text-green-300" />
                  <span>실시간 업데이트</span>
                </div>
              </div>
            </div>

            {/* Email Registration Card */}
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
                  <Bell className="h-8 w-8 text-primary-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  알림 받기 시작하기
                </h2>
                <p className="text-gray-600">
                  이메일 주소만 입력하면 바로 시작할 수 있습니다
                </p>
              </div>
              
              <EmailRegistrationForm />
              
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-500 text-center">
                  이미 구독 중이신가요?{' '}
                  <Link to="/papers" className="text-primary-600 hover:text-primary-700 font-medium">
                    논문 목록 보기
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              서비스 현황
            </h2>
            <p className="text-lg text-gray-600">
              실시간으로 업데이트되는 논문 알림 서비스 통계
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard
              icon={BookOpen}
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
              title="구독자 수"
              value={stats.active_emails || 0}
              description="활성 구독자"
              color="orange"
              loading={loading}
            />
          </div>
        </div>
      </section>

      {/* Recent Papers Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                최근 등록된 논문
              </h2>
              <p className="text-lg text-gray-600">
                새로 등록된 주역 관련 논문들을 확인해보세요
              </p>
            </div>
            
            <Link
              to="/papers"
              className="hidden sm:flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
            >
              <span>전체 보기</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="bg-white rounded-lg p-6 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                </div>
              ))}
            </div>
          ) : recentPapers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentPapers.map((paper) => (
                <PaperCard key={paper.id} paper={paper} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                아직 등록된 논문이 없습니다
              </h3>
              <p className="text-gray-600">
                크롤러가 새로운 논문을 찾는 중입니다...
              </p>
            </div>
          )}

          <div className="text-center mt-8 sm:hidden">
            <Link
              to="/papers"
              className="inline-flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
            >
              <span>전체 보기</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              왜 이 서비스를 사용해야 할까요?
            </h2>
            <p className="text-lg text-gray-600">
              연구자와 학습자를 위한 최적화된 논문 알림 시스템
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-6">
                <Clock className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                실시간 모니터링
              </h3>
              <p className="text-gray-600">
                RISS를 6시간마다 자동으로 확인하여<br />
                새로운 논문을 즉시 감지합니다
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
                <Mail className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                자동 이메일 알림
              </h3>
              <p className="text-gray-600">
                새로운 논문이 발견되면<br />
                예쁘게 정리된 이메일로 바로 알려드립니다
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-6">
                <BookOpen className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                논문 아카이브
              </h3>
              <p className="text-gray-600">
                발견된 모든 논문을 체계적으로 정리하여<br />
                언제든지 다시 찾아볼 수 있습니다
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default HomePage