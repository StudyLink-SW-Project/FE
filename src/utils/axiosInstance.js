// src/utils/axiosInstance.js
import axios from 'axios';
import { API_BASE_URL } from '../config/api';

// Axios 인스턴스 생성
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // 쿠키 포함
  headers: {
    'Content-Type': 'application/json',
  },
});

// 토큰 갱신 중인지 추적
let isRefreshing = false;
// 갱신 대기 중인 요청들
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// 쿠키에서 refreshToken 가져오기
const getRefreshTokenFromCookie = () => {
  const cookies = document.cookie.split(';');
  for (let cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'refreshToken') {
      return value;
    }
  }
  return null;
};

// Response Interceptor: 401 에러 시 자동 토큰 갱신
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 401 에러이고, 재시도하지 않은 요청일 때
    if (error.response?.status === 401 && !originalRequest._retry) {
      // 토큰 갱신 API 자체가 실패한 경우는 재시도하지 않음
      if (originalRequest.url?.includes('/reissue/access-token')) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // 이미 토큰 갱신 중이면 대기열에 추가
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            return axiosInstance(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = getRefreshTokenFromCookie();

      if (!refreshToken) {
        // refreshToken이 없으면 로그인 페이지로
        isRefreshing = false;
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        // 토큰 갱신 API 호출
        const response = await axios.get(
          `${API_BASE_URL}api/v1/reissue/access-token`,
          {
            headers: {
              Authorization: `Bearer ${refreshToken}`,
            },
            withCredentials: true,
          }
        );

        if (response.data?.isSuccess) {
          const newAccessToken = response.data.result?.accessToken;

          // 새로운 accessToken을 쿠키에 저장 (백엔드가 자동으로 할 수도 있음)
          // 필요시 document.cookie로 설정

          isRefreshing = false;
          processQueue(null, newAccessToken);

          // 원래 요청 재시도
          return axiosInstance(originalRequest);
        }
      } catch (refreshError) {
        // 토큰 갱신 실패 - 로그아웃 처리
        processQueue(refreshError, null);
        isRefreshing = false;
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
