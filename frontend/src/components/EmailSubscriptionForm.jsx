import React, { useState } from 'react'
import { Mail, UserPlus, UserMinus, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../services/api'

const EmailSubscriptionForm = ({ onSuccess }) => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState('subscribe') // 'subscribe' or 'unsubscribe'

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(email)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!email.trim()) {
      toast.error('이메일 주소를 입력해주세요')
      return
    }

    if (!validateEmail(email)) {
      toast.error('올바른 이메일 주소를 입력해주세요')
      return
    }

    setLoading(true)

    try {
      const endpoint = mode === 'subscribe' ? '/emails/subscribe' : '/emails/unsubscribe'
      const response = await api.post(endpoint, { email: email.toLowerCase().trim() })

      if (response.data.success) {
        toast.success(response.data.message)
        setEmail('')
        if (onSuccess) {
          onSuccess()
        }
      } else {
        toast.error(response.data.error || '오류가 발생했습니다')
      }
    } catch (error) {
      if (error.response?.data?.error) {
        toast.error(error.response.data.error)
      } else {
        toast.error(
          mode === 'subscribe' 
            ? '구독 신청 중 오류가 발생했습니다' 
            : '구독 해지 중 오류가 발생했습니다'
        )
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Mode Toggle */}
      <div className="flex rounded-lg border border-gray-200 p-1 bg-gray-50">
        <button
          type="button"
          onClick={() => setMode('subscribe')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${
            mode === 'subscribe'
              ? 'bg-white text-primary-600 shadow-sm border border-gray-200'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <UserPlus className="w-4 h-4" />
          <span>구독하기</span>
        </button>
        <button
          type="button"
          onClick={() => setMode('unsubscribe')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${
            mode === 'unsubscribe'
              ? 'bg-white text-red-600 shadow-sm border border-gray-200'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <UserMinus className="w-4 h-4" />
          <span>구독해지</span>
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            이메일 주소
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your-email@example.com"
              className="input-field pl-10"
              disabled={loading}
              required
            />
          </div>
          <p className="mt-2 text-sm text-gray-500">
            {mode === 'subscribe' 
              ? '새로운 주역 논문 알림을 받을 이메일 주소를 입력해주세요'
              : '구독을 해지할 이메일 주소를 입력해주세요'
            }
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${
            mode === 'subscribe'
              ? 'btn-primary'
              : 'bg-red-600 hover:bg-red-700 focus:ring-red-500 text-white'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              {mode === 'subscribe' ? (
                <UserPlus className="w-5 h-5" />
              ) : (
                <UserMinus className="w-5 h-5" />
              )}
              <span>
                {mode === 'subscribe' ? '알림 구독하기' : '구독 해지하기'}
              </span>
            </>
          )}
        </button>
      </form>

      {/* Info Box */}
      <div className={`p-4 rounded-lg border ${
        mode === 'subscribe' 
          ? 'bg-primary-50 border-primary-200' 
          : 'bg-red-50 border-red-200'
      }`}>
        <h4 className={`font-medium mb-2 ${
          mode === 'subscribe' ? 'text-primary-800' : 'text-red-800'
        }`}>
          {mode === 'subscribe' ? '📬 구독 안내' : '📭 구독 해지 안내'}
        </h4>
        <ul className={`text-sm space-y-1 ${
          mode === 'subscribe' ? 'text-primary-700' : 'text-red-700'
        }`}>
          {mode === 'subscribe' ? (
            <>
              <li>• 새로운 주역 논문 발견 시 즉시 알림 발송</li>
              <li>• 논문 제목, 저자, 링크 정보 포함</li>
              <li>• 언제든지 구독 해지 가능</li>
              <li>• 이메일 주소는 알림 목적으로만 사용</li>
            </>
          ) : (
            <>
              <li>• 해당 이메일로 더 이상 알림이 발송되지 않습니다</li>
              <li>• 언제든지 다시 구독할 수 있습니다</li>
              <li>• 구독 해지는 즉시 적용됩니다</li>
            </>
          )}
        </ul>
      </div>
    </div>
  )
}

export default EmailSubscriptionForm