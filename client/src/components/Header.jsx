import { Link, useLocation } from 'react-router-dom'
import { BookOpen, Home, Users, Settings } from 'lucide-react'

function Header() {
  const location = useLocation()
  
  const isActive = (path) => {
    return location.pathname === path
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="bg-primary-600 p-2 rounded-lg group-hover:bg-primary-700 transition-colors duration-200">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  📚 RISS 주역 논문 알림
                </h1>
                <p className="text-xs text-gray-500 hidden sm:block">
                  새로운 주역 논문을 자동으로 알려드립니다
                </p>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            <Link
              to="/"
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive('/') 
                  ? 'bg-primary-100 text-primary-700 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Home className="h-4 w-4" />
              <span>홈</span>
            </Link>
            
            <Link
              to="/papers"
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive('/papers') 
                  ? 'bg-primary-100 text-primary-700 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <BookOpen className="h-4 w-4" />
              <span>논문 목록</span>
            </Link>
            
            <Link
              to="/admin"
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive('/admin') 
                  ? 'bg-primary-100 text-primary-700 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Settings className="h-4 w-4" />
              <span>관리</span>
            </Link>
          </nav>

          {/* Mobile Navigation Button */}
          <div className="md:hidden">
            <button className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors duration-200">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Navigation Menu */}
      <div className="md:hidden border-t border-gray-200 bg-gray-50">
        <div className="px-4 py-2 space-y-1">
          <Link
            to="/"
            className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              isActive('/') 
                ? 'bg-primary-100 text-primary-700' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <Home className="h-4 w-4" />
            <span>홈</span>
          </Link>
          
          <Link
            to="/papers"
            className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              isActive('/papers') 
                ? 'bg-primary-100 text-primary-700' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <BookOpen className="h-4 w-4" />
            <span>논문 목록</span>
          </Link>
          
          <Link
            to="/admin"
            className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              isActive('/admin') 
                ? 'bg-primary-100 text-primary-700' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <Settings className="h-4 w-4" />
            <span>관리</span>
          </Link>
        </div>
      </div>
    </header>
  )
}

export default Header