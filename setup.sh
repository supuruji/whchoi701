#!/bin/bash

echo "🚀 RISS 주역 논문 알림 시스템 설치를 시작합니다..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js가 설치되어 있지 않습니다. Node.js 18.0.0 이상을 설치해주세요."
    echo "다운로드: https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2)
REQUIRED_VERSION="18.0.0"

if ! node -e "
    const current = '$NODE_VERSION'.split('.').map(Number);
    const required = '$REQUIRED_VERSION'.split('.').map(Number);
    for(let i = 0; i < 3; i++) {
        if (current[i] > required[i]) process.exit(0);
        if (current[i] < required[i]) process.exit(1);
    }
    process.exit(0);
"; then
    echo "❌ Node.js 버전이 18.0.0 미만입니다. 현재 버전: $NODE_VERSION"
    echo "Node.js 18.0.0 이상을 설치해주세요."
    exit 1
fi

echo "✅ Node.js 버전 확인: $NODE_VERSION"

# Install root dependencies
echo "📦 루트 종속성 설치 중..."
npm install

# Install server dependencies
echo "📦 서버 종속성 설치 중..."
cd server && npm install
if [ $? -ne 0 ]; then
    echo "❌ 서버 종속성 설치 실패"
    exit 1
fi

# Install client dependencies
echo "📦 클라이언트 종속성 설치 중..."
cd ../client && npm install
if [ $? -ne 0 ]; then
    echo "❌ 클라이언트 종속성 설치 실패"
    exit 1
fi

# Go back to root
cd ..

# Create necessary directories
echo "📁 필요한 디렉토리 생성 중..."
mkdir -p server/data server/scripts

# Copy environment file if it doesn't exist
if [ ! -f "server/.env" ]; then
    echo "📝 환경 설정 파일 생성 중..."
    cp server/.env.example server/.env
    echo "⚠️  server/.env 파일을 편집하여 이메일 설정을 입력해주세요!"
else
    echo "✅ 환경 설정 파일이 이미 존재합니다."
fi

echo ""
echo "🎉 설치가 완료되었습니다!"
echo ""
echo "📋 다음 단계:"
echo "1. server/.env 파일을 편집하여 이메일 설정을 입력하세요"
echo "2. 개발 서버를 시작하세요: npm run dev"
echo "3. 웹 브라우저에서 http://localhost:3000을 열어보세요"
echo ""
echo "🔧 이메일 설정 예시 (Gmail):"
echo "SMTP_HOST=smtp.gmail.com"
echo "SMTP_PORT=587"
echo "SMTP_USER=your-email@gmail.com"
echo "SMTP_PASS=your-app-password"
echo ""
echo "📚 자세한 설정 방법은 README.md를 참고하세요."
echo ""
echo "⚡ 빠른 시작: npm run dev"