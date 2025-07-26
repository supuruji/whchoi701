import React, { useState, useEffect } from 'react'
import { Mail, Bell, BookOpen, CheckCircle, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../services/api'
import EmailSubscriptionForm from '../components/EmailSubscriptionForm'
import StatsCard from '../components/StatsCard'

const Home = () => {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await api.get('/papers/stats')
      setStats(response.data.data)
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="text-center">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          RISS 주역 논문 모니터
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          RISS에 새로운 주역(I Ching) 관련 논문이 등록되면 즉시 이메일로 알림을 받아보세요. 
          최신 연구 동향을 놓치지 않고 추적할 수 있습니다.
        </p>
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-3 gap-8">
        <div className="text-center">
          <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Bell className="w-6 h-6 text-primary-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">자동 알림</h3>
          <p className="text-gray-600">
            새로운 논문이 발견되면 즉시 이메일로 알림을 보내드립니다
          </p>
        </div>
        
        <div className="text-center">
          <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-6 h-6 text-primary-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">실시간 모니터링</h3>
          <p className="text-gray-600">
            RISS를 정기적으로 모니터링하여 새로운 논문을 빠르게 발견합니다
          </p>
        </div>
        
        <div className="text-center">
          <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Mail className="w-6 h-6 text-primary-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">간편한 구독</h3>
          <p className="text-gray-600">
            이메일 주소만 입력하면 구독 완료! 언제든지 구독 해지 가능합니다
          </p>
        </div>
      </div>

      {/* Statistics */}
      {!loading && stats && (
        <div className="grid md:grid-cols-4 gap-6">
          <StatsCard
            title="전체 구독자"
            value={stats.total_subscribers}
            icon={Mail}
            color="blue"
          />
          <StatsCard
            title="발견된 논문"
            value={stats.total_papers}
            icon={BookOpen}
            color="green"
          />
          <StatsCard
            title="이번 주 신규"
            value={stats.papers_this_week}
            icon={Bell}
            color="purple"
          />
          <StatsCard
            title="이번 달 신규"
            value={stats.papers_this_month}
            icon={CheckCircle}
            color="orange"
          />
        </div>
      )}

      {/* Email Subscription Form */}
      <div className="max-w-2xl mx-auto">
        <div className="card">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              📧 이메일 구독하기
            </h2>
            <p className="text-gray-600">
              새로운 주역 논문 알림을 받으려면 이메일 주소를 입력해주세요
            </p>
          </div>
          
          <EmailSubscriptionForm onSuccess={fetchStats} />
        </div>
      </div>

      {/* How it works */}
      <div className="card">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          🔄 어떻게 작동하나요?
        </h2>
        
        <div className="grid md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 text-sm font-semibold">
              1
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">모니터링</h3>
            <p className="text-sm text-gray-600">
              RISS에서 정기적으로 "주역" 키워드로 검색합니다
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 text-sm font-semibold">
              2
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">새 논문 발견</h3>
            <p className="text-sm text-gray-600">
              이전에 없던 새로운 논문을 자동으로 감지합니다
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 text-sm font-semibold">
              3
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">이메일 발송</h3>
            <p className="text-sm text-gray-600">
              모든 구독자에게 새 논문 정보를 이메일로 전송합니다
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 text-sm font-semibold">
              4
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">알림 수신</h3>
            <p className="text-sm text-gray-600">
              논문 제목, 저자, 링크 등의 정보를 받아보세요
            </p>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="card">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          🙋‍♂️ 자주 묻는 질문
        </h2>
        
        <div className="space-y-6">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">얼마나 자주 확인하나요?</h3>
            <p className="text-gray-600">
              기본적으로 30분마다 RISS를 확인하여 새로운 논문을 찾습니다.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">어떤 논문들을 찾나요?</h3>
            <p className="text-gray-600">
              "주역" 키워드가 포함된 모든 논문을 대상으로 합니다. 제목, 키워드, 초록 등에서 해당 키워드를 검색합니다.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">구독 해지는 어떻게 하나요?</h3>
            <p className="text-gray-600">
              아래 구독 해지 폼을 사용하거나, 알림 이메일에 포함된 구독 해지 링크를 클릭하시면 됩니다.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">개인정보는 안전한가요?</h3>
            <p className="text-gray-600">
              이메일 주소만 수집하며, 알림 목적으로만 사용됩니다. 제3자에게 제공되지 않습니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home