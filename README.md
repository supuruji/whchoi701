# 📚 RISS 주역 논문 자동 알림 시스템

RISS(한국교육학술정보원)에서 새로 등록되는 **주역** 관련 논문을 자동으로 감지하여 이메일로 알림을 보내주는 시스템입니다.

## ✨ 주요 기능

- 🔍 **자동 논문 감지**: 6시간마다 RISS를 크롤링하여 새로운 주역 논문 확인
- 📧 **이메일 알림**: 새 논문 발견 시 등록된 이메일로 자동 알림 발송
- 🗂️ **논문 아카이브**: 발견된 모든 논문을 체계적으로 저장 및 관리
- 🎯 **구독 관리**: 간편한 이메일 등록/해제 기능
- 📊 **관리자 대시보드**: 시스템 현황 및 구독자 관리
- 🎨 **반응형 웹 인터페이스**: 모바일/데스크톱 지원

## 🛠️ 기술 스택

### Frontend
- **React 18** + **Vite** - 모던 프론트엔드 개발
- **Tailwind CSS** - 유틸리티 기반 스타일링
- **Lucide React** - 아이콘 라이브러리
- **React Hot Toast** - 사용자 피드백
- **Axios** - HTTP 클라이언트

### Backend
- **Node.js** + **Express** - 서버 프레임워크
- **SQLite** - 경량 데이터베이스
- **Puppeteer** - 웹 크롤링
- **Nodemailer** - 이메일 발송
- **Node-cron** - 스케줄링

## 📋 사전 요구사항

- **Node.js** 18.0.0 이상
- **npm** 또는 **yarn**
- **Git**

## 🚀 설치 및 실행

### 1. 프로젝트 클론
```bash
git clone <repository-url>
cd riss-paper-notification-system
```

### 2. 종속성 설치
```bash
# 루트 프로젝트 및 서버/클라이언트 종속성 모두 설치
npm run setup
```

또는 개별 설치:
```bash
# 루트 종속성
npm install

# 서버 종속성
cd server && npm install

# 클라이언트 종속성
cd ../client && npm install
```

### 3. 환경 설정
```bash
cd server
cp .env.example .env
```

`.env` 파일을 편집하여 이메일 설정을 입력합니다:
```env
# 서버 설정
PORT=5000
NODE_ENV=development

# 이메일 설정 (Gmail 예시)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# 애플리케이션 설정
APP_NAME="RISS 주역 논문 알림 시스템"
DEFAULT_KEYWORD="주역"
```

### 4. 실행

#### 개발 모드 (권장)
```bash
# 루트 디렉토리에서 서버와 클라이언트 동시 실행
npm run dev
```

#### 개별 실행
```bash
# 서버만 실행 (포트 5000)
npm run server

# 클라이언트만 실행 (포트 3000)
npm run client
```

#### 프로덕션 모드
```bash
# 클라이언트 빌드
npm run build

# 서버 실행
npm start
```

### 5. 접속
- **웹 애플리케이션**: http://localhost:3000
- **API 서버**: http://localhost:5000
- **Health Check**: http://localhost:5000/api/health

## 📁 프로젝트 구조

```
📦 riss-paper-notification-system/
├── 📂 client/                    # React 프론트엔드
│   ├── 📂 src/
│   │   ├── 📂 components/        # 재사용 가능한 컴포넌트
│   │   ├── 📂 pages/            # 페이지 컴포넌트
│   │   ├── 📂 services/         # API 서비스
│   │   └── 📄 App.jsx           # 메인 앱 컴포넌트
│   ├── 📄 package.json
│   └── 📄 vite.config.js
│
├── 📂 server/                    # Node.js 백엔드
│   ├── 📂 database/             # 데이터베이스 관련
│   ├── 📂 routes/               # API 라우트
│   ├── 📂 services/             # 비즈니스 로직
│   ├── 📂 data/                 # SQLite 데이터베이스 파일
│   ├── 📄 index.js              # 서버 진입점
│   └── 📄 .env.example          # 환경변수 예시
│
├── 📄 package.json              # 루트 package.json
└── 📄 README.md                 # 프로젝트 문서
```

## 📧 이메일 설정

### Gmail 사용 시
1. Gmail 계정에서 **2단계 인증** 활성화
2. **앱 비밀번호** 생성
3. `.env` 파일에 설정:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password  # 16자리 앱 비밀번호
```

### 다른 이메일 서비스
- **Outlook**: `smtp-mail.outlook.com`
- **Yahoo**: `smtp.mail.yahoo.com`
- **Naver**: `smtp.naver.com`

## 🔧 주요 API 엔드포인트

### 이메일 관리
- `POST /api/email/register` - 이메일 등록
- `GET /api/email/list` - 등록된 이메일 목록 (관리자)
- `DELETE /api/email/unsubscribe/:email` - 구독 해제
- `GET /api/email/status/:email` - 구독 상태 확인

### 논문 관리
- `GET /api/papers` - 논문 목록 (페이지네이션)
- `GET /api/papers/recent` - 최근 논문
- `GET /api/papers/search?q=검색어` - 논문 검색
- `GET /api/papers/stats` - 통계 정보

### 시스템
- `GET /api/health` - 서버 상태 확인

## 🔄 크롤링 시스템

### 동작 방식
1. **자동 실행**: 서버 시작 후 5초 뒤 첫 실행, 이후 6시간마다 반복
2. **RISS 검색**: '주역' 키워드로 논문 검색
3. **중복 제거**: 이미 등록된 논문은 제외
4. **알림 발송**: 새 논문 발견 시 모든 구독자에게 이메일 발송

### 설정
- **크롤링 주기**: 6시간 (환경변수로 변경 가능)
- **검색 키워드**: "주역" (하드코딩, 추후 설정 가능)
- **타임아웃**: 30초

## 🎯 사용 방법

### 일반 사용자
1. 웹사이트 접속
2. 메인 페이지에서 이메일 주소 입력
3. "알림 받기 시작하기" 버튼 클릭
4. 이메일로 새 논문 알림 수신

### 관리자
1. `/admin` 페이지 접속
2. **개요**: 시스템 통계 및 상태 확인
3. **이메일 관리**: 구독자 목록 및 관리
4. **시스템 설정**: 크롤링 수동 실행 등

## 🚨 문제 해결

### 일반적인 문제

#### 1. 이메일이 발송되지 않는 경우
- `.env` 파일의 SMTP 설정 확인
- 이메일 서비스의 앱 비밀번호 사용 여부 확인
- 방화벽/보안 프로그램 확인

#### 2. 크롤링이 실행되지 않는 경우
- Puppeteer 의존성 설치 확인
- 서버 로그 확인 (`npm run server`)
- RISS 웹사이트 접근 가능 여부 확인

#### 3. 데이터베이스 오류
- `server/data/` 디렉토리 권한 확인
- SQLite 설치 확인

### 로그 확인
```bash
# 서버 로그 확인
cd server && npm run dev

# 상세 디버깅
DEBUG=* npm run server
```

## 🔒 보안 고려사항

### 프로덕션 배포 시 필수 사항
1. **환경변수 보안**: `.env` 파일을 안전하게 관리
2. **HTTPS 사용**: SSL 인증서 적용
3. **인증 시스템**: 관리자 페이지 접근 제한
4. **Rate Limiting**: API 요청 제한
5. **입력 검증**: 사용자 입력 데이터 검증 강화

## 🔮 향후 개선 사항

- [ ] 다중 키워드 지원
- [ ] 사용자별 키워드 설정
- [ ] 웹훅 알림 지원
- [ ] 논문 즐겨찾기 기능
- [ ] 고급 검색 필터
- [ ] 관리자 인증 시스템
- [ ] Docker 컨테이너화
- [ ] 클라우드 배포 가이드

## 📄 라이선스

MIT License - 자유롭게 사용, 수정, 배포 가능합니다.

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 문의

프로젝트 관련 문의사항이나 버그 리포트는 GitHub Issues를 이용해 주세요.

---

**⚡ 빠른 시작**: `npm run setup && npm run dev` 실행 후 http://localhost:3000 접속
