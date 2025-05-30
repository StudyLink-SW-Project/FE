// src/pages/StudyRoomEntry.jsx
import { Navigate, useLocation } from "react-router-dom";
import { LiveKitRoom } from "@livekit/components-react";
import StudyRoomInside from "./StudyRoomInside";

const LIVEKIT_URL =
    "wss://api.studylink.store:443";

export default function StudyRoomEntry() {
  const { state } = useLocation();
  const token = state?.token;
  console.log("LIVEKIT_URL", LIVEKIT_URL, "token", token);
  if (!token) {
    // 토큰 없으면 목록 페이지로 리다이렉트]
    return <Navigate to="/study-room" replace />;
  }
  return (
    <LiveKitRoom 
      token={token} 
      serverUrl={LIVEKIT_URL} 
      connect={true}
      video={true}
      audio={true}
    >
      <StudyRoomInside/>
    </LiveKitRoom>
  );
}