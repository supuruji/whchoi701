import { Github, Mail, ExternalLink } from 'lucide-react'

function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* About Section */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-primary-600 p-2 rounded-lg">
                <span className="text-white text-lg">📚</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">
                  RISS 주역 논문 알림 시스템
                </h3>
                <p className="text-sm text-gray-400">
                  새로운 주역 관련 논문을 자동으로 알려드립니다
                </p>
              </div>
            </div>
            
            <p className="text-gray-400 text-sm mb-4 leading-relaxed">
              이 서비스는 RISS(한국교육학술정보원)에서 제공하는 학술정보를 기반으로<br />
              '주역' 키워드와 관련된 새로운 논문이 등록될 때마다<br />
              등록된 이메일로 자동 알림을 발송합니다.
            </p>
            
            <div className="flex items-center space-x-4">
              <a 
                href="http://www.riss.kr" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center space-x-1 text-sm text-gray-400 hover:text-white transition-colors duration-200"
              >
                <ExternalLink className="h-4 w-4" />
                <span>RISS 바로가기</span>
              </a>
              
              <a 
                href="mailto:support@example.com"
                className="flex items-center space-x-1 text-sm text-gray-400 hover:text-white transition-colors duration-200"
              >
                <Mail className="h-4 w-4" />
                <span>문의하기</span>
              </a>
            </div>
          </div>

          {/* Features Section */}
          <div>
            <h4 className="text-white font-semibold mb-4">주요 기능</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>• 자동 논문 탐지</li>
              <li>• 이메일 알림 발송</li>
              <li>• 논문 목록 조회</li>
              <li>• 구독 관리</li>
              <li>• 통계 및 현황</li>
            </ul>
          </div>

          {/* Tech Stack */}
          <div>
            <h4 className="text-white font-semibold mb-4">기술 스택</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>• React + Vite</li>
              <li>• Node.js + Express</li>
              <li>• SQLite Database</li>
              <li>• Puppeteer Crawler</li>
              <li>• Nodemailer</li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm text-gray-400 mb-4 md:mb-0">
              <p>© 2024 RISS 주역 논문 알림 시스템. MIT License.</p>
              <p className="text-xs mt-1">
                이 서비스는 RISS의 공개 데이터를 활용하며, 교육 및 연구 목적으로 개발되었습니다.
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-xs text-gray-500">
                마지막 업데이트: {new Date().toLocaleDateString('ko-KR')}
              </span>
              
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-gray-400">서비스 운영 중</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer