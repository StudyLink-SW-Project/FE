// src/store/authThunks.js
import { createAsyncThunk } from '@reduxjs/toolkit';
import { loginSuccess, logout as logoutAction } from './authSlice';
import axiosInstance from '../utils/axiosInstance';

// 로그인
export const loginThunk = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { dispatch, rejectWithValue }) => {
    try {
      const resp = await axiosInstance.post('user/login', { email, password });
      const data = resp.data;

      if (!data.isSuccess) {
        // 서버가 알려준 메시지를 에러로 반환
        return rejectWithValue(data.message);
      }
      // payload로 사용할 사용자 정보
      const user = data.result || { email };

      // 1) 리덕스 스토어에 저장
      dispatch(loginSuccess({ user }));

      // 2) 브라우저 저장소에도 저장
      localStorage.setItem('user', JSON.stringify(user));

      return user;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// 사용자 정보 조회 (예: 새로고침 시 세션 유지용)
export const fetchInfoThunk = createAsyncThunk(
  'auth/fetchInfo',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const resp = await axiosInstance.get('user/info');
      const data = resp.data;

      if (!data.isSuccess) {
        throw new Error(data.message || '사용자 정보 조회 실패');
      }
      const user = data.result;

      // 1) 리덕스 스토어에 저장
      dispatch(loginSuccess({ user }));

      // 2) 브라우저 저장소에도 저장
      localStorage.setItem('user', JSON.stringify(user));

      return user;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// 로그아웃
export const logoutThunk = createAsyncThunk(
  'auth/logout',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      await axiosInstance.post('user/logout');

      // 1) 리덕스 스토어에서 제거
      dispatch(logoutAction());

      // 2) 브라우저 저장소에서도 제거
      localStorage.removeItem('user');

      return;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// 회원가입
export const signupThunk = createAsyncThunk(
  'auth/signup',
  async ({ email, name, password }, { rejectWithValue }) => {
    try {
      const resp = await axiosInstance.post('user/signup', { email, name, password });
      const data = resp.data;

      if (!data.isSuccess) {
        throw new Error(data.message);
      }
      return;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);
