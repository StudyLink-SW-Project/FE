// src/App.jsx
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import StudyRoom from "./pages/StudyRoom";
import Questions from "./pages/Questions";
import MyQuestions from "./pages/MyQuestions";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import StudyRoomEntry from "./pages/StudyRoomEntry";
import QuestionDetail from "./pages/QuestionDetail";
import OAuth2Callback from "./pages/OAuth2Callback";
import { GoalProvider } from './contexts/GoalContext';

export default function App() {
  return (
    <>
      <ToastContainer position="top-center" />
      <GoalProvider>
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
      </GoalProvider>
    </>
  );
}
