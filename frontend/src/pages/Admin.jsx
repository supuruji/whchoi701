import React, { useState, useEffect } from 'react'
import { Users, Mail, FileText, Activity, Trash2, RefreshCw, Loader2, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../services/api'
import StatsCard from '../components/StatsCard'

const Admin = () => {
  const [stats, setStats] = useState(null)
  const [subscribers, setSubscribers] = useState([])
  const [loading, setLoading] = useState({
    stats: true,
    subscribers: true
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    await Promise.all([
      fetchStats(),
      fetchSubscribers()
    ])
  }

  const fetchStats = async () => {
    try {
      setLoading(prev => ({ ...prev, stats: true }))
      const response = await api.get('/papers/stats')
      setStats(response.data.data)
    } catch (error) {
      console.error('Failed to fetch stats:', error)
      toast.error('통계 정보를 불러오는데 실패했습니다')
    } finally {
      setLoading(prev => ({ ...prev, stats: false }))
    }
  }

  const fetchSubscribers = async () => {
    try {
      setLoading(prev => ({ ...prev, subscribers: true }))
      const response = await api.get('/emails')
      setSubscribers(response.data.data || [])
    } catch (error) {
      console.error('Failed to fetch subscribers:', error)
      toast.error('구독자 목록을 불러오는데 실패했습니다')
    } finally {
      setLoading(prev => ({ ...prev, subscribers: false }))
    }
  }

  const handleRemoveSubscriber = async (email) => {
    if (!confirm(`정말로 ${email}의 구독을 해지하시겠습니까?`)) {
      return
    }

    try {
      const response = await api.post('/emails/unsubscribe', { email })
      
      if (response.data.success) {
        toast.success('구독이 해지되었습니다')
        await fetchSubscribers()
        await fetchStats()
      }
    } catch (error) {
      console.error('Failed to remove subscriber:', error)
      toast.error('구독 해지 중 오류가 발생했습니다')
    }
  }

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return dateString
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">⚙️ 시스템 관리</h1>
          <p className="text-gray-600 mt-2">
            시스템 통계와 구독자를 관리할 수 있습니다
          </p>
        </div>
        <button
          onClick={fetchData}
          disabled={loading.stats || loading.subscribers}
          className="btn-secondary mt-4 sm:mt-0 flex items-center space-x-2"
        >
          <RefreshCw className={`w-4 h-4 ${(loading.stats || loading.subscribers) ? 'animate-spin' : ''}`} />
          <span>새로고침</span>
        </button>
      </div>

      {/* Statistics */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">📊 시스템 통계</h2>
        
        {loading.stats ? (
          <div className="grid md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="card animate-pulse">
                <div className="h-16 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : stats ? (
          <div className="grid md:grid-cols-4 gap-6">
            <StatsCard
              title="전체 구독자"
              value={stats.total_subscribers}
              icon={Users}
              color="blue"
            />
            <StatsCard
              title="발견된 논문"
              value={stats.total_papers}
              icon={FileText}
              color="green"
            />
            <StatsCard
              title="이번 주 신규"
              value={stats.papers_this_week}
              icon={Activity}
              color="purple"
            />
            <StatsCard
              title="총 알림 발송"
              value={stats.total_notifications}
              icon={Mail}
              color="orange"
            />
          </div>
        ) : (
          <div className="card text-center py-8">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <p className="text-gray-600">통계 정보를 불러올 수 없습니다</p>
          </div>
        )}
      </div>

      {/* System Status */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">🔄 시스템 상태</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-700 mb-2">크롤러 상태</h4>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              <span className="text-sm text-gray-600">활성 (30분마다 실행)</span>
            </div>
          </div>
          <div>
            <h4 className="font-medium text-gray-700 mb-2">이메일 서비스</h4>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              <span className="text-sm text-gray-600">정상 동작</span>
            </div>
          </div>
        </div>
      </div>

      {/* Subscribers Management */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">👥 구독자 관리</h2>
        
        <div className="card">
          {loading.subscribers ? (
            <div className="text-center py-8">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-primary-600" />
              <p className="text-gray-600">구독자 목록을 불러오는 중...</p>
            </div>
          ) : subscribers.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">구독자가 없습니다</h3>
              <p className="text-gray-600">아직 등록된 구독자가 없습니다</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      이메일 주소
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      구독 일시
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      최근 알림
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      작업
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {subscribers.map((subscriber) => (
                    <tr key={subscriber.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Mail className="w-4 h-4 text-gray-400 mr-2" />
                          <span className="text-sm font-medium text-gray-900">
                            {subscriber.email}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {formatDate(subscriber.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {subscriber.last_notified_at 
                          ? formatDate(subscriber.last_notified_at)
                          : '없음'
                        }
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleRemoveSubscriber(subscriber.email)}
                          className="text-red-600 hover:text-red-900 flex items-center space-x-1"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>구독 해지</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      {stats && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📈 최근 활동</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">이번 주 새로 발견된 논문</span>
              <span className="font-medium text-green-600">{stats.papers_this_week}편</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">이번 달 새로 발견된 논문</span>
              <span className="font-medium text-blue-600">{stats.papers_this_month}편</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-600">마지막 업데이트</span>
              <span className="text-sm text-gray-500">{formatDate(stats.last_updated)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Admin