import { useState } from 'react'
import toast from 'react-hot-toast'
import { Mail, Check, AlertCircle } from 'lucide-react'
import { emailAPI, handleAPIError } from '../services/api'

function EmailRegistrationForm() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
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
      const response = await emailAPI.register(email)
      setSubmitted(true)
      toast.success(response.message || '이메일이 성공적으로 등록되었습니다!')
      
      // Reset form after success
      setTimeout(() => {
        setEmail('')
        setSubmitted(false)
      }, 3000)
      
    } catch (error) {
      const errorMessage = handleAPIError(error)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="text-center py-8 animate-bounce-in">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
          <Check className="h-8 w-8 text-green-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          등록 완료!
        </h3>
        <p className="text-gray-600 mb-4">
          <span className="font-medium text-green-600">{email}</span> 주소로<br />
          새로운 논문 알림을 보내드리겠습니다.
        </p>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-green-700 text-left">
              <p className="font-medium mb-1">알림 설정 안내</p>
              <ul className="space-y-1 text-green-600">
                <li>• 6시간마다 새로운 논문을 확인합니다</li>
                <li>• 새 논문 발견 시 즉시 이메일을 발송합니다</li>
                <li>• 언제든지 구독을 취소할 수 있습니다</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
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
            className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900 placeholder-gray-500"
            disabled={loading}
            required
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading || !email.trim()}
        className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
      >
        {loading ? (
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full"></div>
            <span>등록 중...</span>
          </div>
        ) : (
          <div className="flex items-center justify-center space-x-2">
            <Mail className="h-4 w-4" />
            <span>알림 받기 시작하기</span>
          </div>
        )}
      </button>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-700">
            <p className="font-medium mb-1">개인정보 보호</p>
            <p>
              입력하신 이메일 주소는 논문 알림 발송 목적으로만 사용되며, 
              외부에 제공되지 않습니다. 언제든지 구독을 취소할 수 있습니다.
            </p>
          </div>
        </div>
      </div>
    </form>
  )
}

export default EmailRegistrationForm