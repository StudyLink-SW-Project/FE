// src/store/authThunks.js
import { createAsyncThunk } from '@reduxjs/toolkit';
import { loginSuccess, logout as logoutAction } from './authSlice';

const API = import.meta.env.DEV ? '/' : import.meta.env.VITE_APP_SERVER;

// 로그인
export const loginThunk = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { dispatch, rejectWithValue }) => {
    try {
      const resp = await fetch(`${API}user/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });
      const data = await resp.json();
      if (!data.isSuccess) {
        // 서버가 알려준 메시지를 에러로 반환
        return rejectWithValue(data.message);
      }
      // payload로 사용할 사용자 정보
      const user = data.result || { email };

      // 1) 리덕스 스토어에 저장
      dispatch(loginSuccess({ user }));

      return user;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// 사용자 정보 조회 (예: 새로고침 시 세션 유지용)
export const fetchInfoThunk = createAsyncThunk(
  'auth/fetchInfo',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const resp = await fetch(`${API}user/info`, {
        method: 'POST',
        credentials: 'include',
      });
      const data = await resp.json();
      if (!resp.ok) {
        throw new Error(data.message || '사용자 정보 조회 실패');
      }
      const user = data.result;

      // 1) 리덕스 스토어에 저장
      dispatch(loginSuccess({ user }));

      return user;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// 로그아웃
export const logoutThunk = createAsyncThunk(
  'auth/logout',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      await fetch(`${API}user/logout`, {
        method: 'POST',
        credentials: 'include',
      });

      // 1) 리덕스 스토어에서 제거
      dispatch(logoutAction());

      return;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// 회원가입
export const signupThunk = createAsyncThunk(
  'auth/signup',
  async ({ email, name, password }, { rejectWithValue }) => {
    try {
      const resp = await fetch(`${API}user/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, password }),
      });
      const data = await resp.json();
      if (!data.result?.isSuccess) {
        throw new Error(data.message);
      }
      return;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);
