// src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import StudyRoom from "./pages/StudyRoom";
import Questions from "./pages/Questions";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import StudyRoomInside from "./pages/StudyRoomInside";
import QuestionDetail from "./pages/QuestionDetail";
import VideoRoom from "./components/VideoRoom";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/study-room" element={<StudyRoom />} />
      <Route path="/questions" element={<Questions />} />
      <Route path="/questions/:id" element={<QuestionDetail />} />
      <Route path="/login" element={<LoginPage  />} />
      <Route path="/signup" element={<SignupPage  />} />
      <Route path="/study-room/:id" element={<StudyRoomInside />} />
      <Route path="/video-room" element={<VideoRoom />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
