// src/pages/StudyRoomEntry.jsx
import { Navigate, useLocation } from "react-router-dom";
import { LiveKitRoom } from "@livekit/components-react";
import StudyRoomInside from "./StudyRoomInside";

const LIVEKIT_URL = window.location.hostname === "localhost"
  ? "ws://localhost:7880/"
  : "wss://api.studylink.store:443";

export default function StudyRoomEntry() {
  const location = useLocation();
  const token = location.state?.token;

  // 토큰이 없다면 목록으로 되돌아가게
  if (!token) {
    return <Navigate to="/study-room" replace />;
  }

  return (
    <LiveKitRoom
      // LiveKitRoom 컴포넌트를 통해 아래 훅/컴포넌트들이 세션에 접근 가능
      url={LIVEKIT_URL}
      token={token}
      connectOptions={{ /* 예: audio: true, video: true 등 */ }}
    >
      <StudyRoomInside />
    </LiveKitRoom>
  );
}
