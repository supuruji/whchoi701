import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { BookOpen, Mail, Settings, FileText } from 'lucide-react'

const Layout = ({ children }) => {
  const location = useLocation()

  const navigation = [
    {
      name: '홈',
      href: '/',
      icon: BookOpen,
      description: '이메일 구독'
    },
    {
      name: '논문 목록',
      href: '/papers',
      icon: FileText,
      description: '발견된 논문들'
    },
    {
      name: '관리',
      href: '/admin',
      icon: Settings,
      description: '시스템 관리'
    }
  ]

  const isActive = (path) => {
    return location.pathname === path
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link to="/" className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-bold text-xl text-gray-900">RISS 주역 모니터</span>
                </Link>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {navigation.map((item) => {
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`${
                        isActive(item.href)
                          ? 'border-primary-500 text-primary-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 flex items-center space-x-1`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.name}</span>
                    </Link>
                  )
                })}
              </div>
            </div>
            
            {/* Mobile menu button */}
            <div className="sm:hidden flex items-center">
              <div className="flex items-center space-x-2">
                <Mail className="w-5 h-5 text-primary-600" />
                <span className="text-sm font-medium text-gray-700">주역 알림</span>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile navigation */}
        <div className="sm:hidden border-t border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`${
                    isActive(item.href)
                      ? 'bg-primary-50 border-primary-500 text-primary-700'
                      : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
                  } block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-colors duration-200 flex items-center space-x-2`}
                >
                  <Icon className="w-4 h-4" />
                  <div>
                    <span className="block">{item.name}</span>
                    <span className="text-sm text-gray-500">{item.description}</span>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-sm text-gray-600">
              RISS 주역 논문 모니터링 서비스 • 새로운 논문을 자동으로 찾아 알려드립니다
            </p>
            <p className="text-xs text-gray-500 mt-2">
              이 서비스는 RISS에서 제공하는 공개 정보를 기반으로 합니다
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Layout