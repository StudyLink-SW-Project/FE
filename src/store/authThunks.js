import { createAsyncThunk } from '@reduxjs/toolkit';

const API = import.meta.env.DEV ? '/' : import.meta.env.VITE_APP_SERVER;

// 로그인
export const loginThunk = createAsyncThunk(
  'auth/login',
  async ({ email, password }) => {
    const resp = await fetch(`${API}user/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    });
    const data = await resp.json();
    if (!data.isSuccess) throw new Error(data.message);
    // 로그인 성공 후 서버에서 내려준 사용자 정보가 있다면 data.result 사용
    return data.result || { email };
  }
);

// 사용자 정보 조회
export const fetchInfoThunk = createAsyncThunk(
  'auth/fetchInfo',
  async () => {
    const resp = await fetch(`${API}user/info`, {
      method: 'POST',
      credentials: 'include',
    });
    const data = await resp.json();
    if (!resp.ok) throw new Error('사용자 정보 조회 실패');
    return data.result;
  }
);

// 로그아웃
export const logoutThunk = createAsyncThunk(
  'auth/logout',
  async () => {
    await fetch(`${API}user/logout`, {
      method: 'POST',
      credentials: 'include'
    });
    return;
  }
);

// 회원가입
export const signupThunk = createAsyncThunk(
  'auth/signup',
  async ({ email, name, password }) => {
    const resp = await fetch(`${API}user/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name, password }),
    });
    const data = await resp.json();
    if (!data.result?.isSuccess) throw new Error(data.message);
    return;
  }
);
