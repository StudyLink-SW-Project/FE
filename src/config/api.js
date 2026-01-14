// src/config/api.js
// API 엔드포인트 중앙 관리

// 백엔드 API 서버 URL
export const APP_SERVER = import.meta.env.VITE_APP_SERVER || "http://localhost:6080/";

// LiveKit WebSocket URL (환경변수 필수)
export const LIVEKIT_URL = import.meta.env.VITE_LIVEKIT_URL;

// 개발/프로덕션 환경에 따른 API 엔드포인트
export const API_BASE_URL = import.meta.env.DEV
  ? "/"
  : import.meta.env.VITE_APP_SERVER || "https://api.studylink.store/";
