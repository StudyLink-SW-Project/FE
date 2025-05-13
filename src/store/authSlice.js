import { createSlice } from '@reduxjs/toolkit';
import { loginThunk, logoutThunk, signupThunk, fetchInfoThunk } from './authThunks';

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    loading: false,
    error: null,
  },
  reducers: {
    // 추가로 필요하다면 일반 액션도 정의
  },
  extraReducers: builder => {
    builder
      // login
      .addCase(loginThunk.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginThunk.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.user = payload;       // payload: { name, email, ... }
      })
      .addCase(loginThunk.rejected, (state, { error }) => {
        state.loading = false;
        state.error = error.message;
      })
      // fetchUserInfo
      .addCase(fetchInfoThunk.fulfilled, (state, { payload }) => {
        state.user = payload;
      })
      // logout
      .addCase(logoutThunk.fulfilled, state => {
        state.user = null;
      })
      // signup 등도 유사하게…
  }
});

export default authSlice.reducer;
