// src/App.jsx
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import { fetchInfoThunk } from './store/authThunks';

import Home from "./pages/Home";
import StudyRoom from "./pages/StudyRoom";
import Questions from "./pages/Questions";
import MyQuestions from "./pages/MyQuestions";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import StudyRoomEntry from "./pages/StudyRoomEntry";
import QuestionDetail from "./pages/QuestionDetail";
import OAuth2Callback from "./pages/OAuth2Callback";

export default function App() {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);

  useEffect(() => {
    // 앱 시작 시 localStorage에 user가 있으면 세션 유효성 검증
    const storedUser = localStorage.getItem('user');
    if (storedUser && !user) {
      // 사용자 정보를 다시 가져와서 세션이 유효한지 확인
      dispatch(fetchInfoThunk()).catch(() => {
        // 세션이 만료되었으면 localStorage 정리
        localStorage.removeItem('user');
      });
    }
  }, [dispatch, user]);

  return (
    <>
      <ToastContainer position="top-center" />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/study-room" element={
          <ProtectedRoute>
            <StudyRoom />
          </ProtectedRoute>
        } />
        <Route path="/questions" element={
          <ProtectedRoute>
            <Questions />
          </ProtectedRoute>
        } />
        <Route path="/my-questions" element={
          <ProtectedRoute>
            <MyQuestions />
          </ProtectedRoute>
        } />
        <Route path="/questions/:id" element={<QuestionDetail />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route
          path="/study-room/:id"
          element={
            <ProtectedRoute>
              <StudyRoomEntry />
            </ProtectedRoute>
          }
        />
        <Route path="/login/oauth2/code/:provider" element={<OAuth2Callback />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
