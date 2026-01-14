# StudyLink AWS + LiveKit Cloud 배포 가이드

## 목차
1. [배포 아키텍처](#배포-아키텍처)
2. [AWS 인프라 설정](#1-aws-인프라-설정)
3. [LiveKit Cloud 설정](#2-livekit-cloud-설정)
4. [백엔드 배포 (AWS EC2)](#3-백엔드-배포-aws-ec2)
5. [프론트엔드 배포 (Netlify)](#4-프론트엔드-배포-netlify)
6. [OAuth 콜백 URL 수정](#5-oauth-콜백-url-수정)
7. [배포 후 테스트](#6-배포-후-테스트)
8. [CI/CD 파이프라인 설정](#7-cicd-파이프라인-설정)
9. [비용 예상](#비용-예상)
10. [모니터링 및 관리](#모니터링-및-관리)

---

## 배포 아키텍처

```
[클라이언트 브라우저]
        ↓
        ↓ HTTPS
        ↓
[Netlify - 프론트엔드]
studylink.store
        ↓
        ↓ API 요청
        ↓
[AWS EC2 - Spring Boot API]
api.studylink.store:6080
        ↓
        ↓ SQL 쿼리
        ↓
[AWS RDS MySQL]
Private Subnet
        ↓
        ↓ 비디오 토큰 발급
        ↓
[LiveKit Cloud - 비디오 서비스]
wss://livekit.cloud/...
```

**구성 요소:**
- **프론트엔드**: Netlify (무료, React + Vite)
- **백엔드**: AWS EC2 t3.micro (Ubuntu 22.04, Java 17, Spring Boot)
- **데이터베이스**: AWS RDS MySQL 8.0 (db.t3.micro)
- **비디오 서비스**: LiveKit Cloud (Starter Plan, 무료 50GB/월)
- **도메인**: studylink.store, api.studylink.store
- **SSL**: Let's Encrypt (무료)

---

## 1. AWS 인프라 설정

### 1.1 VPC 및 네트워크 설정

#### VPC 생성
1. AWS 콘솔 → **VPC** → **VPC 생성**
2. 설정:
   - 이름: `studylink-vpc`
   - IPv4 CIDR: `10.0.0.0/16`
   - IPv6 CIDR: 없음
   - 테넌시: 기본

#### Subnet 생성
**Public Subnet (EC2용)**
1. **서브넷 생성** 클릭
2. 설정:
   - 이름: `studylink-public-subnet`
   - VPC: `studylink-vpc`
   - 가용 영역: `ap-northeast-2a` (서울)
   - IPv4 CIDR: `10.0.1.0/24`

**Private Subnet (RDS용)**
1. **서브넷 생성** 클릭
2. 설정:
   - 이름: `studylink-private-subnet-1`
   - VPC: `studylink-vpc`
   - 가용 영역: `ap-northeast-2a`
   - IPv4 CIDR: `10.0.2.0/24`
3. 두 번째 Private Subnet 생성 (RDS는 최소 2개 AZ 필요):
   - 이름: `studylink-private-subnet-2`
   - 가용 영역: `ap-northeast-2c`
   - IPv4 CIDR: `10.0.3.0/24`

#### Internet Gateway 설정
1. **인터넷 게이트웨이** → **인터넷 게이트웨이 생성**
2. 이름: `studylink-igw`
3. 생성 후 **VPC에 연결** → `studylink-vpc` 선택

#### Route Table 구성
**Public Route Table**
1. **라우팅 테이블** → **라우팅 테이블 생성**
2. 이름: `studylink-public-rt`
3. VPC: `studylink-vpc`
4. 생성 후 **라우팅 편집**:
   - 대상: `0.0.0.0/0`
   - 타겟: `studylink-igw`
5. **서브넷 연결** → `studylink-public-subnet` 연결

#### Security Group 설정
**EC2 Security Group**
1. **보안 그룹** → **보안 그룹 생성**
2. 이름: `studylink-ec2-sg`
3. VPC: `studylink-vpc`
4. 인바운드 규칙:
   ```
   유형        프로토콜    포트 범위    소스
   SSH         TCP         22          내 IP (보안상 관리자 IP만)
   HTTP        TCP         80          0.0.0.0/0
   HTTPS       TCP         443         0.0.0.0/0
   Custom TCP  TCP         6080        0.0.0.0/0
   ```
5. 아웃바운드 규칙: 모든 트래픽 허용 (기본값)

**RDS Security Group**
1. 이름: `studylink-rds-sg`
2. VPC: `studylink-vpc`
3. 인바운드 규칙:
   ```
   유형        프로토콜    포트    소스
   MySQL/Aurora TCP        3306    studylink-ec2-sg (EC2 SG ID)
   ```

---

### 1.2 DB Subnet Group 생성 (RDS 사전 요구사항)

RDS를 생성하기 전에 DB Subnet Group을 먼저 만들어야 합니다.

1. AWS 콘솔 → **RDS** → 왼쪽 메뉴에서 **서브넷 그룹**
2. **DB 서브넷 그룹 생성** 클릭
3. 설정:
   - 이름: `studylink-db-subnet-group`
   - 설명: `StudyLink RDS private subnets`
   - VPC: `studylink-vpc` 선택
   - 가용 영역: `ap-northeast-2a`, `ap-northeast-2c` 선택
   - 서브넷:
     - `studylink-private-subnet-1` (10.0.2.0/24) 선택
     - `studylink-private-subnet-2` (10.0.3.0/24) 선택
4. **생성** 클릭

### 1.3 RDS MySQL 데이터베이스 생성

1. AWS 콘솔 → **RDS** → **데이터베이스 생성**

2. **데이터베이스 생성 방식 선택**:
   - **표준 생성** 선택 (Easy create가 아님!)

3. **엔진 옵션**:
   - 엔진 유형: **MySQL**
   - 에디션: **MySQL Community**
   - 버전: **MySQL 8.0.xx** (최신 8.0 버전)

4. **템플릿**:
   - **프리 티어** 선택 (테스트 환경)
   - 또는 **개발/테스트** (프로덕션 환경)

5. **설정**:
   - DB 인스턴스 식별자: `studylink-db`
   - 마스터 사용자 이름: `admin`
   - 마스터 암호: `<강력한-암호-설정>` (16자 이상, 특수문자 포함)
   - 암호 확인: 동일하게 입력
   - ⚠️ **암호를 안전한 곳에 기록하세요!**

6. **인스턴스 구성**:
   - DB 인스턴스 클래스: **버스터블 클래스** → `db.t3.micro` 선택

7. **스토리지**:
   - 스토리지 유형: **범용 SSD (gp3)**
   - 할당된 스토리지: **20** GiB
   - 스토리지 자동 조정: 활성화 (선택사항)

8. **연결**:
   - **컴퓨팅 리소스**: **EC2 컴퓨팅 리소스에 연결 안 함** 선택
   - **네트워크 유형**: IPv4
   - **Virtual Private Cloud (VPC)**: `studylink-vpc` 선택
   - **DB 서브넷 그룹**: `studylink-db-subnet-group` 선택
   - **퍼블릭 액세스**: **아니요** (중요!)
   - **VPC 보안 그룹**:
     - **기존 항목 선택** 라디오 버튼 클릭
     - `studylink-rds-sg` 선택
     - `default` 보안 그룹은 제거

9. **추가 구성** (펼치기):
   - **초기 데이터베이스 이름**: `studylink` 입력
   - 자동 백업: 활성화 (7일 보관 권장)
   - 백업 기간: 새벽 시간대 선택

10. **생성** 클릭 (약 5-10분 소요)

11. 생성 완료 후 **엔드포인트** 확인 및 기록:
    - RDS → 데이터베이스 → `studylink-db` 클릭
    - **연결 & 보안** 탭에서 **엔드포인트** 복사
    ```
    예시: studylink-db.xxxxxxxxx.ap-northeast-2.rds.amazonaws.com
    ```

---

### 1.4 EC2 인스턴스 생성

1. AWS 콘솔 → **EC2** → **인스턴스 시작**
2. 설정:
   - 이름: `studylink-backend`
   - AMI: **Ubuntu Server 22.04 LTS** (64비트 x86)
   - 인스턴스 유형: **t3.micro** (1 vCPU, 1GB RAM)
     - **주의**: 테스트 환경용. 프로덕션은 t3.small 이상 권장
   - 키 페어: 새로 생성 또는 기존 선택 (`.pem` 파일 다운로드 및 안전 보관)
   - 네트워크 설정:
     - VPC: `studylink-vpc`
     - 서브넷: `studylink-public-subnet`
     - 퍼블릭 IP 자동 할당: **활성화**
     - 보안 그룹: `studylink-ec2-sg`
   - 스토리지: 20GB gp3
3. **인스턴스 시작** 클릭

#### Elastic IP 할당
1. **Elastic IP** → **Elastic IP 주소 할당**
2. 할당 후 **작업** → **Elastic IP 주소 연결**
3. 인스턴스: `studylink-backend` 선택
4. Elastic IP 주소 기록:
   ```
   예시: 3.35.123.45
   ```

---

### 1.5 도메인 및 SSL 설정

#### DNS A 레코드 설정

**가비아(Gabia) 사용 시 (권장):**

1. **가비아 관리 콘솔 접속**
   - https://www.gabia.com 로그인
   - **My가비아** → **서비스 관리**

2. **도메인 선택**
   - 구매한 도메인 (예: `studylink.store`) 클릭
   - **DNS 설정** 또는 **DNS 관리** 메뉴 선택

3. **네임서버 확인**
   - 가비아 기본 네임서버 사용 확인:
     ```
     ns.gabia.co.kr
     ns1.gabia.co.kr
     ```
   - 외부 네임서버를 사용 중이라면 가비아 네임서버로 변경 (적용까지 최대 24시간 소요)

4. **DNS 레코드 추가**
   - **레코드 추가** 또는 **레코드 수정** 버튼 클릭

   **백엔드 API용 A 레코드:**
   ```
   호스트(Host): api
   타입(Type): A
   값/위치(Value): <EC2-Elastic-IP>
   TTL: 3600 (1시간) 또는 기본값
   ```

   **프론트엔드용 A 레코드 (Netlify 사용 시):**
   ```
   호스트: @ (또는 비워둠)
   타입: A
   값: <Netlify-IP-주소>
   TTL: 3600
   ```

   **www 서브도메인 (선택사항):**
   ```
   호스트: www
   타입: CNAME
   값: studylink.store (또는 Netlify 도메인)
   TTL: 3600
   ```

5. **저장 및 적용**
   - **저장** 또는 **적용** 버튼 클릭
   - DNS 전파 대기 (보통 10-30분, 최대 24시간)

6. **DNS 전파 확인**
   ```bash
   # Windows (PowerShell)
   nslookup api.studylink.store

   # Mac/Linux
   dig api.studylink.store

   # 또는 온라인 도구 사용
   # https://www.whatsmydns.net
   ```

**Route 53 사용 시:**
1. Route 53 → **호스팅 영역** → 도메인 선택
2. **레코드 생성**:
   ```
   레코드 이름: api
   레코드 유형: A
   값: <EC2 Elastic IP>
   TTL: 300
   ```

#### SSH 접속 테스트
```bash
# Windows (PowerShell/WSL) 또는 Mac/Linux
ssh -i "your-key.pem" ubuntu@<EC2-Elastic-IP>

# 처음 접속 시 키 권한 설정 (Mac/Linux)
chmod 400 your-key.pem
```

---

## 2. LiveKit Cloud 설정

### 2.1 LiveKit Cloud 계정 생성

1. https://cloud.livekit.io 접속
2. **Sign Up** → GitHub 또는 Google 계정으로 가입
3. 가입 완료 후 대시보드 진입

### 2.2 프로젝트 생성

1. 대시보드에서 **Create Project** 클릭
2. 프로젝트 이름: `StudyLink`
3. Region: **Asia Pacific (Seoul)** 또는 **Asia Pacific (Tokyo)** 선택
4. **Create** 클릭

### 2.3 API Credentials 발급

1. 프로젝트 대시보드 → **Settings** → **Keys** 탭
2. 다음 정보 기록:
   ```
   LiveKit URL: wss://studylink-xxxxxxxx.livekit.cloud
   API Key: APIxxxxxxxxxxxxxxxx
   API Secret: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```
   ⚠️ **중요**: Secret은 다시 볼 수 없으므로 안전하게 보관!

### 2.4 Webhook 설정

1. **Settings** → **Webhooks** 탭
2. **Add Webhook** 클릭
3. 설정:
   ```
   Webhook URL: https://api.studylink.store/api/v1/video/livekit/webhook
   Events: room_started, participant_joined, participant_left 선택
   ```
4. **Save** 클릭

### 2.5 요금제 확인

1. **Billing** → **Plan** 확인
2. **Starter Plan** (무료):
   - 50GB 트래픽/월
   - 제한된 SLA
   - 소규모 테스트에 적합
3. 트래픽 초과 시 **Developer Plan** ($99/월) 업그레이드 고려

---

## 3. 백엔드 배포 (AWS EC2)

### 3.1 서버 초기 설정

EC2에 SSH 접속 후 다음 명령어 실행:

```bash
# 시스템 업데이트
sudo apt update && sudo apt upgrade -y

# Java 17 설치
sudo apt install openjdk-17-jdk -y

# Java 버전 확인
java -version
# 출력 예시: openjdk version "17.0.x"

# Git 설치 (코드 클론용, 선택사항)
sudo apt install git -y

# Nginx 설치
sudo apt install nginx -y

# Certbot 설치 (SSL 인증서)
sudo apt install certbot python3-certbot-nginx -y

# 방화벽 설정 (UFW)
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw allow 6080/tcp
sudo ufw enable
```

---

### 3.2 애플리케이션 빌드 및 배포

#### 3.2.1 로컬에서 JAR 빌드

**Windows (PowerShell):**
```powershell
cd C:\Spring\studyLink\BE

# Gradle 빌드 (테스트 제외)
.\gradlew clean build -x test

# 빌드 성공 확인
ls build\libs\*.jar
```

#### 3.2.2 JAR 파일을 EC2로 전송

```bash
# SCP를 사용한 파일 전송
scp -i key_hojun.pem build/libs/*.jar ubuntu@43.200.105.80:/home/ubuntu/app.jar

# 전송 확인
ssh -i key_hojun.pem ubuntu@43.200.105.80 "ls -lh /home/ubuntu/app.jar"
```

---

### 3.3 환경 변수 설정

#### 방법 1: application-prod.yml 파일 생성 (권장)

EC2에서 실행:
```bash
sudo mkdir -p /home/ubuntu/config
sudo nano /home/ubuntu/config/application-prod.yml
```

내용 입력:
```yaml
spring:
  datasource:
    url: jdbc:mysql://studylink-db.cd8qcimkew4w.ap-northeast-2.rds.amazonaws.com:3306/studylink?useSSL=true&serverTimezone=Asia/Seoul
    username: admin
    password: Xx9547029!
    driver-class-name: com.mysql.cj.jdbc.Driver

  security:
    require-ssl: true
    oauth2:
      client:
        registration:
          google:
            client-id: 43617860520-kkgru3jpp3te7daaj1mbnbikvrl27nuu.apps.googleusercontent.com
            client-secret: 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
            scope:
              - email
              - profile
          naver:
            client-id: WzP_38uKy7iK8_9_HUPV
            client-secret: pkaZIVlxp8
            scope:
              - name
              - email
            client-name: Naver
            authorization-grant-type: authorization_code
            redirect-uri: https://api.studylink.store/login/oauth2/code/naver
          kakao:
            client-id: d65193931be25a11769f18dd073ab1f5
            client-secret: lt2oWb0ZtOM9yJUJuGaNTvp7Pq8Q6wuR
            redirect-uri: https://api.studylink.store/login/oauth2/code/kakao
            authorization-grant-type: authorization_code
            client-authentication-method: client_secret_post
            client-name: Kakao
            scope:
              - profile_nickname
              - account_email

        provider:
          naver:
            authorization-uri: https://nid.naver.com/oauth2.0/authorize
            token-uri: https://nid.naver.com/oauth2.0/token
            user-info-uri: https://openapi.naver.com/v1/nid/me
            user-name-attribute: response
          kakao:
            authorization-uri: https://kauth.kakao.com/oauth/authorize
            token-uri: https://kauth.kakao.com/oauth/token
            user-info-uri: https://kapi.kakao.com/v2/user/me
            user-name-attribute: id

  jpa:
    hibernate:
      ddl-auto: update
      naming:
        physical-strategy: org.hibernate.boot.model.naming.PhysicalNamingStrategyStandardImpl
    properties:
      hibernate:
        format_sql: true
        default_batch_fetch_size: 1000
    database-platform: org.hibernate.dialect.MySQL8Dialect

jwt:
  secret: sjfhksdjhkdsjfalksdjfklasdjgjdsfhkjdhfjshdkjfhsdkjfhkjshdkjfhdafsdfasfas
  redirect: https://studylink.store/
  access-token:
    expiration-time: 3600000
  refresh-token:
    expiration-time: 604800000

server:
  port: 6080

livekit:
  api:
    host: https://studylink-4yf381df.livekit.cloud
    key: APIz2UieYpgGzic
    secret: fuc9qf2K38rQzHswo7afUWkO7DxnerAarXADmrxpyvbB
```

**JWT Secret 생성:**
```bash
# 64자 랜덤 문자열 생성
openssl rand -base64 48
```

파일 권한 설정:
```bash
sudo chmod 600 /home/ubuntu/config/application-prod.yml
sudo chown ubuntu:ubuntu /home/ubuntu/config/application-prod.yml
```

---

### 3.4 Nginx 리버스 프록시 설정

#### Nginx 설정 파일 생성

```bash
sudo nano /etc/nginx/sites-available/api.studylink.store
```

내용 입력:
```nginx
server {
    server_name api.studylink.store;

    location / {
        proxy_pass http://localhost:6080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # WebSocket 지원 (필요 시)
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";

        # 타임아웃 설정
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    listen 80;
}
```

설정 활성화:
```bash
# 심볼릭 링크 생성
sudo ln -s /etc/nginx/sites-available/api.studylink.store /etc/nginx/sites-enabled/

# 기본 사이트 비활성화 (선택사항)
sudo rm /etc/nginx/sites-enabled/default

# 설정 테스트
sudo nginx -t

# Nginx 재시작
sudo systemctl restart nginx
sudo systemctl status nginx
```

---

### 3.5 SSL 인증서 발급

```bash
# Certbot으로 SSL 인증서 자동 발급
sudo certbot --nginx -d api.studylink.store

# 프롬프트에서 입력:
# - 이메일 주소 입력
# - 약관 동의 (Y)
# - 뉴스레터 구독 (선택사항, N 가능)
# - HTTP를 HTTPS로 리다이렉트? (2번 선택 권장)
```

인증서 자동 갱신 설정 확인:
```bash
# 갱신 테스트
sudo certbot renew --dry-run

# Certbot timer 확인 (자동 갱신)
sudo systemctl status certbot.timer
```

---

### 3.6 Systemd 서비스 등록

#### 서비스 파일 생성

```bash
sudo nano /etc/systemd/system/studylink.service
```

내용 입력:
```ini
[Unit]
Description=StudyLink Backend API
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/home/ubuntu
ExecStart=/usr/bin/java -jar /home/ubuntu/app.jar --spring.profiles.active=prod --spring.config.location=/home/ubuntu/config/application-prod.yml
Restart=on-failure
RestartSec=10
StandardOutput=journal
StandardError=journal

# JVM 옵션 (t3.micro용 메모리 최적화)
Environment="JAVA_OPTS=-Xms256m -Xmx768m -XX:MaxMetaspaceSize=256m"

[Install]
WantedBy=multi-user.target
```

서비스 등록 및 시작:
```bash
# 데몬 리로드
sudo systemctl daemon-reload

# 서비스 활성화 (부팅 시 자동 시작)
sudo systemctl enable studylink

# 서비스 시작
sudo systemctl start studylink

# 상태 확인
sudo systemctl status studylink

# 로그 확인
sudo journalctl -u studylink -f
```

---

## 4. 프론트엔드 배포 (Netlify)

### 4.1 GitHub 연동

1. GitHub에서 프론트엔드 저장소 확인
2. Netlify 대시보드 → **Add new site** → **Import an existing project**
3. **GitHub** 선택 → 저장소 선택 (`StudyLink-SW-Project/FE`)
4. 권한 허용

### 4.2 빌드 설정

1. 빌드 설정 확인:
   ```
   Base directory: (비워둠)
   Build command: npm run build
   Publish directory: dist
   ```
2. `netlify.toml` 파일이 이미 있으므로 자동 인식됨

### 4.3 환경 변수 설정 ⚠️ **중요!**

Netlify에서 환경변수를 설정하지 않으면 LiveKit 연결이 실패합니다!

1. Netlify 대시보드 → **Site settings** → **Environment variables**
2. **Add a variable** 클릭하여 다음 변수 추가:

   **변수 1: VITE_APP_SERVER**
   ```
   Key: VITE_APP_SERVER
   Value: https://api.studylink.store/
   Scopes: Production, Deploy Previews, Branch deploys (모두 체크)
   ```

   **변수 2: VITE_LIVEKIT_URL**
   ```
   Key: VITE_LIVEKIT_URL
   Value: wss://studylink-4yf381df.livekit.cloud
   Scopes: Production, Deploy Previews, Branch deploys (모두 체크)
   ```

3. **Save** 클릭

⚠️ **주의**: 환경변수를 추가한 후에는 **반드시 재배포**가 필요합니다!
   - **Deploys** → **Trigger deploy** → **Deploy site**

### 4.4 도메인 설정

1. **Domain settings** → **Add custom domain**
2. 도메인 입력: `studylink.store`
3. DNS 레코드 설정 (Netlify 안내에 따라):
   ```
   Type: A
   Name: @ (또는 studylink.store)
   Value: <Netlify IP 주소>

   Type: CNAME
   Name: www
   Value: <your-site>.netlify.app
   ```
4. HTTPS 자동 활성화 (Let's Encrypt)

### 4.5 배포

1. **Deploys** → **Trigger deploy** → **Deploy site**
2. 빌드 로그 확인 (약 2-3분 소요)
3. 배포 완료 후 `https://studylink.store` 접속 테스트

---

## 5. OAuth 콜백 URL 수정

### 5.1 Google Cloud Console

1. https://console.cloud.google.com 접속
2. 프로젝트 선택
3. **API 및 서비스** → **사용자 인증 정보**
4. OAuth 2.0 클라이언트 ID 선택
5. **승인된 리디렉션 URI** 추가:
   ```
   https://api.studylink.store/login/oauth2/code/google
   ```
6. **저장**

### 5.2 Naver Developers

1. https://developers.naver.com/apps 접속
2. 애플리케이션 선택
3. **API 설정** → **서비스 URL** 및 **Callback URL** 수정:
   ```
   서비스 URL: https://studylink.store
   Callback URL: https://api.studylink.store/login/oauth2/code/naver
   ```
4. **수정** 클릭

### 5.3 Kakao Developers

1. https://developers.kakao.com/console 접속
2. 애플리케이션 선택
3. **제품 설정** → **카카오 로그인**
4. **Redirect URI** 추가:
   ```
   https://api.studylink.store/login/oauth2/code/kakao
   ```
5. **저장**

---

## 6. 배포 후 테스트

### 6.1 백엔드 API 테스트

```bash
# 헬스 체크 (Actuator 활성화된 경우)
curl https://api.studylink.store/actuator/health

# LiveKit 토큰 발급 테스트
curl -X POST https://api.studylink.store/api/v1/video/token \
  -H "Content-Type: application/json" \
  -H "Cookie: accessToken=<your-access-token>" \
  -d '{
    "roomName": "test-room-123",
    "participantName": "test-user"
  }'

# 예상 응답:
# {
#   "isSuccess": true,
#   "code": "OK",
#   "message": "성공",
#   "result": {
#     "token": "eyJhbGc..."
#   }
# }
```

### 6.2 프론트엔드 접속 테스트

1. https://studylink.store 접속
2. 회원가입 → 로그인
3. 스터디룸 생성
4. 비디오 연결 테스트

### 6.3 LiveKit 연결 테스트

1. 스터디룸 입장
2. 카메라/마이크 권한 허용
3. 비디오 스트리밍 정상 작동 확인
4. 다른 브라우저/기기에서 동일 룸 입장하여 P2P 연결 확인

### 6.4 로그 확인

**백엔드 로그:**
```bash
# EC2 SSH 접속 후
sudo journalctl -u studylink -f --lines=100
```

**Nginx 로그:**
```bash
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

**LiveKit Cloud 로그:**
- LiveKit Cloud 대시보드 → **Logs** 탭 확인

---

## 7. CI/CD 파이프라인 설정

### 7.1 GitHub Actions 백엔드 자동 배포

#### Secrets 설정

GitHub 저장소 → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

추가할 Secrets:
```
EC2_HOST=43.200.105.80
EC2_USER=ubuntu
EC2_SSH_KEY=<your-private-key-content> (전체 내용 복사)
```

#### 워크플로우 파일 생성

`C:\Spring\studyLink\BE\.github\workflows\deploy.yml`:
```yaml
name: Deploy Backend to EC2

on:
  push:
    branches:
      - main
  workflow_dispatch:

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Set up JDK 17
        uses: actions/setup-java@v3
        with:
          java-version: '17'
          distribution: 'temurin'

      - name: Grant execute permission for gradlew
        run: chmod +x gradlew

      - name: Build with Gradle
        run: ./gradlew clean build -x test

      - name: Create SSH key file
        run: |
          echo "${{ secrets.EC2_SSH_KEY }}" > private_key.pem
          chmod 600 private_key.pem

      - name: Deploy to EC2
        run: |
          scp -i private_key.pem -o StrictHostKeyChecking=no \
            build/libs/*.jar ${{ secrets.EC2_USER }}@${{ secrets.EC2_HOST }}:/home/ubuntu/app.jar

          ssh -i private_key.pem -o StrictHostKeyChecking=no \
            ${{ secrets.EC2_USER }}@${{ secrets.EC2_HOST }} << 'EOF'
            sudo systemctl restart studylink
            sudo systemctl status studylink
          EOF

      - name: Clean up
        if: always()
        run: rm -f private_key.pem

      - name: Send deployment notification
        if: success()
        run: echo "Deployment successful!"
```

### 7.2 프론트엔드 자동 배포

Netlify는 GitHub 연동 시 자동 배포가 설정됩니다:
- `main` 브랜치에 푸시 시 자동 빌드 및 배포
- PR 생성 시 Preview 배포 자동 생성

별도 설정 불필요!

### 7.3 배포 프로세스

**백엔드 배포:**
1. 코드 수정 후 `main` 브랜치에 push
2. GitHub Actions가 자동으로 빌드
3. EC2에 JAR 파일 업로드 및 서비스 재시작

**프론트엔드 배포:**
1. 코드 수정 후 `main` 브랜치에 push
2. Netlify가 자동으로 빌드 및 배포

---

## 비용 예상

### AWS
- **EC2 t3.micro**: ~$7-8/월 (테스트 환경)
  - 프로덕션 환경에서는 t3.small (~$15/월) 권장
- **RDS MySQL db.t3.micro**: ~$15/월
- **Elastic IP**: 무료 (인스턴스에 연결된 상태)
- **데이터 전송**: ~$2-5/월 (소규모 트래픽 기준)
- **총 AWS 비용**: ~$24-28/월

### LiveKit Cloud
- **Starter Plan**: 무료 (50GB 트래픽/월)
- 트래픽 초과 시 Developer Plan: $99/월

### Netlify
- **Free Tier**: 100GB 대역폭/월
- **비용**: 무료

### 총 예상 비용
- **테스트 환경**: $24-28/월
- **프로덕션 확장 시**: $131-150/월 (EC2 업그레이드 + LiveKit Developer)

---

## 모니터링 및 관리

### CloudWatch 설정 (선택사항)

1. AWS 콘솔 → **CloudWatch** → **Log groups**
2. EC2에 CloudWatch Agent 설치
3. 애플리케이션 로그 수집 설정

### RDS 백업

1. RDS 콘솔 → DB 인스턴스 선택
2. **자동 백업** 활성화
3. 백업 보존 기간: 7일
4. 백업 시간: 새벽 시간대 설정

### LiveKit 사용량 모니터링

1. LiveKit Cloud 대시보드 → **Analytics**
2. 트래픽, 동시 접속자 수, 세션 기록 확인
3. 50GB 한도 근접 시 알림 설정

### 정기 점검

- **주간**: EC2 로그 확인, 오류 모니터링
- **월간**: RDS 백업 스냅샷 확인, 비용 리뷰
- **분기**: 보안 패치 적용, SSL 인증서 갱신 확인 (Certbot 자동)

---

## 보안 체크리스트

- [ ] EC2 Security Group에서 SSH를 관리자 IP로만 제한
- [ ] RDS는 Private Subnet에 배치하고 EC2 SG에서만 접근
- [ ] JWT_SECRET은 64자 이상 랜덤 문자열 사용
- [ ] 모든 민감한 환경변수를 코드에 하드코딩하지 않음
- [ ] SSL 인증서 자동 갱신 설정 (Certbot)
- [ ] RDS 암호는 강력한 암호 사용 (최소 16자, 특수문자 포함)
- [ ] EC2 정기 보안 패치 적용 (`sudo apt update && sudo apt upgrade`)
- [ ] 불필요한 포트는 Security Group에서 차단
- [ ] IAM 사용자별 최소 권한 원칙 적용
- [ ] CloudWatch 알람 설정 (CPU, 메모리, 디스크 사용률)

---

## 트러블슈팅

### 1. EC2 접속 불가
```bash
# 키 권한 확인
chmod 400 your-key.pem

# Security Group 인바운드 규칙 확인 (SSH 22번 포트)
# Elastic IP가 인스턴스에 올바르게 연결되었는지 확인
```

### 2. 백엔드 서비스 시작 실패
```bash
# 로그 확인
sudo journalctl -u studylink -n 100 --no-pager

# Java 버전 확인
java -version

# 포트 충돌 확인
sudo netstat -tulpn | grep 6080
```

### 3. RDS 연결 실패
```bash
# EC2에서 RDS 연결 테스트
mysql -h <RDS-엔드포인트> -u admin -p

# Security Group 확인: RDS SG에 EC2 SG가 허용되어 있는지
# RDS 엔드포인트가 올바른지 확인
```

### 4. Nginx 502 Bad Gateway
```bash
# 백엔드 서비스 상태 확인
sudo systemctl status studylink

# Nginx 설정 테스트
sudo nginx -t

# Nginx 에러 로그
sudo tail -f /var/log/nginx/error.log
```

### 5. LiveKit 연결 실패
- LiveKit Cloud URL이 정확한지 확인
- Webhook URL이 HTTPS로 설정되어 있는지 확인
- 백엔드 로그에서 토큰 발급 오류 확인

---

## 추가 리소스

- [AWS EC2 공식 문서](https://docs.aws.amazon.com/ec2/)
- [LiveKit Cloud 문서](https://docs.livekit.io/cloud/)
- [Netlify 문서](https://docs.netlify.com/)
- [Spring Boot 배포 가이드](https://spring.io/guides/gs/spring-boot-docker/)
- [Let's Encrypt Certbot](https://certbot.eff.org/)

---

**작성일**: 2026-01-05
**작성자**: StudyLink 개발팀
**버전**: 1.0
