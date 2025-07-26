# 📚 RISS 주역 논문 모니터링 시스템

RISS(한국교육학술정보원)에서 새로운 "주역" 관련 논문이 등록될 때마다 자동으로 감지하여 이메일 알림을 발송하는 시스템입니다.

## ✨ 주요 기능

- 🔍 **자동 모니터링**: RISS를 정기적으로 크롤링하여 새로운 주역 관련 논문 감지
- 📧 **이메일 알림**: 새 논문 발견 시 구독자에게 자동 이메일 발송
- 💻 **웹 인터페이스**: 이메일 구독/해지, 논문 목록 조회, 시스템 관리
- 📊 **통계 대시보드**: 발견된 논문 수, 구독자 수 등 시스템 통계
- 🎨 **반응형 UI**: 모바일/데스크톱 모든 환경에서 최적화된 사용자 경험

## 🏗️ 시스템 아키텍처

```
Frontend (React + Vite)
    ↓
Backend (Node.js + Express)
    ↓
Database (SQLite)
    ↓
Services:
  - RISS Crawler (Puppeteer)
  - Email Service (Nodemailer)
  - Cron Jobs (node-cron)
```

## 🚀 빠른 시작

### 1. 설치

```bash
# 저장소 클론
git clone <repository-url>
cd riss-paper-monitor

# 모든 의존성 설치
npm run install:all
```

### 2. 환경 설정

```bash
# 백엔드 환경 변수 설정
cp backend/.env.example backend/.env
```

`backend/.env` 파일을 편집하여 설정을 완료하세요:

```env
# 데이터베이스
DB_PATH=./database/riss_monitor.db

# 이메일 설정 (Gmail 예시)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password  # Gmail 앱 비밀번호

# 서버 설정
PORT=3001
NODE_ENV=development

# 크롤러 설정
SEARCH_KEYWORD=주역
CRAWLER_INTERVAL=*/30 * * * *  # 30분마다 실행
```

### 3. 개발 서버 실행

```bash
# 프론트엔드와 백엔드를 동시에 실행
npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

## 📁 프로젝트 구조

```
riss-paper-monitor/
├── backend/                 # Node.js 백엔드
│   ├── config/             # 데이터베이스 설정
│   ├── routes/             # API 라우트
│   ├── services/           # 비즈니스 로직
│   ├── scripts/            # 유틸리티 스크립트
│   └── server.js           # 서버 진입점
├── frontend/               # React 프론트엔드
│   ├── src/
│   │   ├── components/     # 재사용 컴포넌트
│   │   ├── pages/          # 페이지 컴포넌트
│   │   ├── services/       # API 클라이언트
│   │   └── main.jsx        # 앱 진입점
│   └── index.html
├── package.json            # 루트 패키지 설정
└── README.md
```

## 🔧 사용법

### 이메일 구독/해지

1. 웹사이트 접속 (http://localhost:5173)
2. 메인 페이지에서 이메일 주소 입력
3. "알림 구독하기" 또는 "구독 해지하기" 선택
4. 제출 버튼 클릭

### 발견된 논문 확인

1. "논문 목록" 페이지 접속
2. 검색어로 필터링 가능
3. 최근 발견된 논문만 보기 가능
4. 각 논문의 RISS 링크로 원문 접근

### 시스템 관리

1. "관리" 페이지 접속
2. 시스템 통계 확인
3. 구독자 목록 관리
4. 구독자 강제 해지 가능

### 수동 크롤링 실행

```bash
cd backend
npm run crawler
```

## 📧 이메일 설정

### Gmail 설정 방법

1. Google 계정의 2단계 인증 활성화
2. 앱 비밀번호 생성:
   - Google 계정 관리 → 보안 → 앱 비밀번호
   - "메일" 앱 선택하여 비밀번호 생성
3. `.env` 파일에 앱 비밀번호 입력

### 다른 SMTP 서비스

```env
# Outlook/Hotmail
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587

# Yahoo
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587

# 커스텀 SMTP
SMTP_HOST=your-smtp-server.com
SMTP_PORT=587
```

## 🚀 배포

### 프로덕션 빌드

```bash
# 프론트엔드 빌드
npm run build

# 프로덕션 모드로 서버 실행
npm start
```

### 환경 변수 설정

프로덕션 환경에서는 다음 환경 변수를 설정하세요:

```env
NODE_ENV=production
PORT=3001
DB_PATH=/path/to/production/database.db
# ... 기타 설정
```

### 추천 배포 플랫폼

- **Render**: Node.js 앱 자동 배포
- **Railway**: 간단한 배포와 데이터베이스 관리
- **Vercel**: 프론트엔드 + API 통합 배포
- **DigitalOcean**: VPS에서 완전한 제어

## 🔧 API 엔드포인트

### 이메일 관리
- `POST /api/emails/subscribe` - 이메일 구독
- `POST /api/emails/unsubscribe` - 구독 해지
- `GET /api/emails` - 구독자 목록 (관리자)

### 논문 관리
- `GET /api/papers` - 논문 목록
- `GET /api/papers/recent` - 최근 논문
- `GET /api/papers/stats` - 시스템 통계
- `GET /api/papers/:id` - 특정 논문

### 시스템
- `GET /api/health` - 헬스체크

## 🛠️ 개발

### 개발 스크립트

```bash
# 개발 모드 (프론트엔드 + 백엔드)
npm run dev

# 백엔드만 개발 모드
npm run dev:backend

# 프론트엔드만 개발 모드
npm run dev:frontend

# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm start

# 수동 크롤러 실행
cd backend && npm run crawler
```

### 데이터베이스 스키마

```sql
-- 이메일 구독자
CREATE TABLE emails (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT 1,
  last_notified_at DATETIME
);

-- 발견된 논문
CREATE TABLE papers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  author TEXT,
  publication_date TEXT,
  riss_url TEXT,
  riss_id TEXT UNIQUE,
  abstract TEXT,
  keywords TEXT,
  discovered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  is_notified BOOLEAN DEFAULT 0
);

-- 알림 기록
CREATE TABLE notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email_id INTEGER,
  paper_id INTEGER,
  sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  status TEXT DEFAULT 'sent',
  FOREIGN KEY (email_id) REFERENCES emails (id),
  FOREIGN KEY (paper_id) REFERENCES papers (id)
);
```

## 🚨 문제 해결

### 크롤러가 작동하지 않는 경우

1. Puppeteer 의존성 확인:
   ```bash
   cd backend
   npm install puppeteer
   ```

2. 헤드리스 모드 확인 (개발 시):
   - `services/crawler.js`에서 `headless: false`로 변경

3. RISS 접근 확인:
   - 네트워크 연결 상태 확인
   - RISS 웹사이트 구조 변경 여부 확인

### 이메일이 발송되지 않는 경우

1. SMTP 설정 확인:
   ```bash
   # 테스트 이메일 발송 (개발 도구 필요)
   ```

2. Gmail 앱 비밀번호 재생성
3. 방화벽/보안 설정 확인

### 데이터베이스 문제

1. 데이터베이스 파일 권한 확인
2. SQLite 설치 확인
3. 데이터베이스 재생성:
   ```bash
   rm backend/database/riss_monitor.db
   # 서버 재시작하면 자동 재생성
   ```

## 🤝 기여

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 라이선스

This project is licensed under the MIT License.

## 🔮 향후 계획

- [ ] 다양한 키워드 지원
- [ ] 알림 빈도 사용자 설정
- [ ] 논문 상세 정보 크롤링
- [ ] 모바일 앱 개발
- [ ] 다국어 지원
- [ ] 사용자 계정 시스템

---

**주의사항**: 이 시스템은 RISS의 공개 정보를 크롤링합니다. 과도한 요청으로 서버에 부하를 주지 않도록 적절한 간격으로 크롤링하며, 이용약관을 준수해야 합니다.
