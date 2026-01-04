# 토큰 자동 갱신 메커니즘

## 개요
이 프로젝트는 액세스 토큰이 만료되었을 때 자동으로 리프레시 토큰을 사용해 새 액세스 토큰을 발급받는 메커니즘을 구현했습니다.

## 주요 변경사항

### 1. Axios 인스턴스 생성 (`src/utils/axiosInstance.js`)
- **Response Interceptor**를 통해 401 에러 자동 감지
- 401 에러 발생 시 자동으로 `/api/v1/reissue/access-token` API 호출
- 쿠키에서 `refreshToken`을 추출하여 갱신 요청
- 갱신 성공 시 실패했던 원래 요청 자동 재시도
- 갱신 실패 시 로그인 페이지로 리다이렉트

**주요 기능:**
- 토큰 갱신 중 중복 요청 방지 (큐 시스템)
- 여러 API가 동시에 401을 받아도 한 번만 갱신
- 갱신 완료 후 대기 중인 모든 요청 재시도

### 2. Auth Thunks 개선 (`src/store/authThunks.js`)
- `fetch` 대신 `axiosInstance` 사용으로 변경
- 자동 토큰 갱신 기능 적용
- 에러 메시지 처리 개선 (`err.response?.data?.message` 우선 사용)

### 3. 앱 시작 시 세션 검증 (`src/App.jsx`)
- localStorage에 user가 있으면 앱 시작 시 `/user/info` 호출
- 세션이 유효하면 Redux 상태 복원
- 세션이 만료되었으면 localStorage 정리

### 4. 중복 API 호출 제거 (`src/pages/LoginPage.jsx`)
- 로그인 시 `loginThunk` 후 `fetchInfoThunk` 중복 호출 제거
- `loginThunk`가 이미 사용자 정보를 저장하므로 불필요한 API 호출 방지

## 동작 방식

### 로그인 플로우
1. 사용자가 로그인
2. 백엔드가 `accessToken`과 `refreshToken`을 쿠키에 설정
3. Redux 스토어와 localStorage에 사용자 정보 저장

### 토큰 만료 시 자동 갱신 플로우
1. 사용자가 API 요청 (예: `/user/info`)
2. 액세스 토큰 만료로 401 응답
3. **Axios Interceptor**가 자동으로 감지
4. 쿠키에서 `refreshToken` 추출
5. `/api/v1/reissue/access-token` 호출 (Header: `Authorization: Bearer {refreshToken}`)
6. 백엔드가 새 `accessToken` 발급 및 쿠키 갱신
7. 원래 실패했던 요청 자동 재시도
8. 사용자는 아무것도 모르고 정상 동작

### 리프레시 토큰도 만료된 경우
1. 토큰 갱신 API도 401 또는 403 응답
2. localStorage 정리
3. `/login` 페이지로 자동 리다이렉트

## 백엔드 API

### 액세스 토큰 재발급
```
GET /api/v1/reissue/access-token
Authorization: Bearer {refreshToken}
```

**응답:**
```json
{
  "isSuccess": true,
  "code": "CREATED",
  "message": "액세스 토큰이 재발급되었습니다.",
  "result": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

## 설치 및 사용

1. **axios 설치**
   ```bash
   npm install axios
   ```

2. **모든 API 요청에서 axiosInstance 사용**
   ```javascript
   import axiosInstance from '../utils/axiosInstance';

   // 예시
   const response = await axiosInstance.get('user/info');
   const data = response.data;
   ```

3. **fetch 사용 시 주의**
   - fetch로 직접 호출하는 API는 자동 갱신이 적용되지 않음
   - 가능한 모든 API 호출을 `axiosInstance`로 마이그레이션 권장

## 주의사항

- **쿠키 기반 인증**: `refreshToken`과 `accessToken`이 쿠키에 저장됨
- **CSRF 보호**: 백엔드에서 CSRF 토큰 검증이 필요할 수 있음
- **만료 시간**:
  - accessToken: 백엔드 설정 참고 (`jwt.access-token.expiration-time`)
  - refreshToken: 백엔드 설정 참고

## 개선 예정 사항

- [ ] 모든 fetch 호출을 axiosInstance로 마이그레이션
- [ ] OAuth 로그인 후 원래 경로로 리다이렉트 (현재는 항상 `/`로 이동)
- [ ] 토큰 갱신 실패 시 더 친절한 에러 메시지
- [ ] 토큰 만료 5분 전 사전 갱신 (Proactive refresh)
