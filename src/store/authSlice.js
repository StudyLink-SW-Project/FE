// src/store/authSlice.js
import { createSlice } from '@reduxjs/toolkit';
import { loginThunk, logoutThunk, signupThunk, fetchInfoThunk } from './authThunks';

const initialUser = JSON.parse(localStorage.getItem('user')) || null;

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: initialUser,
    loading: false,
    error: null,
  },
  reducers: {
    loginSuccess(state, action) {
      state.user = action.payload.user;
    },
    logout(state) {
      state.user = null;
    },
  },
  extraReducers: builder => {
    builder
      // login
      .addCase(loginThunk.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginThunk.fulfilled, state => {
        state.loading = false;
      })
      .addCase(loginThunk.rejected, (state, { payload, error }) => {
        state.loading = false;
        state.error = payload || error.message;
      })

      // fetchInfo
      .addCase(fetchInfoThunk.fulfilled, state => {
        state.loading = false;
      })
      .addCase(fetchInfoThunk.rejected, (state, { payload, error }) => {
        state.error = payload || error.message;
      })

      // logout
      .addCase(logoutThunk.fulfilled, state => {
        state.user = null;
      });

    // signupThunk 는 필요하다면 추가…
  }
});

export const { loginSuccess, logout } = authSlice.actions;
export default authSlice.reducer;
