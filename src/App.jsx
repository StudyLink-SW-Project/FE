
// src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
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
import ProfilePage from "./pages/ProfilePage"; 

export default function App() {
  return (
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
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
