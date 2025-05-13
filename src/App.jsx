
// src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import StudyRoom from "./pages/StudyRoom";
import Questions from "./pages/Questions";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import StudyRoomInside from "./pages/StudyRoomInside";
import QuestionDetail from "./pages/QuestionDetail";
import VideoRoom from "./pages/VideoRoom";
import OAuth2Callback from "./pages/OAuth2Callback";

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/study-room" element={
          <ProtectedRoute>
            <StudyRoom />
          </ProtectedRoute>
        } />
        <Route path="/questions" element={<Questions />} />
        <Route path="/questions/:id" element={<QuestionDetail />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/study-room/:id" element={
          <ProtectedRoute>
            <StudyRoomInside />
          </ProtectedRoute>
        } />
        <Route path="/video-room" element={
          <ProtectedRoute>
            <VideoRoom />
          </ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
        <Route path="/login/oauth2/code/:provider" element={<OAuth2Callback />} />
      </Routes>
    </AuthProvider>
  );
}
