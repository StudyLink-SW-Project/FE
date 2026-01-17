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

      try {
        // 토큰 갱신 API 호출 (refreshToken은 HttpOnly 쿠키로 자동 전송됨)
        const response = await axios.get(
          `${API_BASE_URL}api/v1/reissue/access-token`,
          { withCredentials: true }
        );

        if (response.data?.isSuccess) {
          isRefreshing = false;
          processQueue(null);

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
