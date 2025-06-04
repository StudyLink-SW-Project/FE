// src/pages/StudyRoomEntry.jsx
import { Navigate, useLocation } from "react-router-dom";
import { 
  LiveKitRoom, 
  GridLayout, 
  ParticipantTile, 
  FocusLayout,
  FocusLayoutContainer,
  CarouselLayout,
  ControlBar,
  Chat,
  RoomAudioRenderer,
  ConnectionStateToast,
  useTracks,
  usePinnedTracks,
  useLayoutContext,
  LayoutContextProvider
} from "@livekit/components-react";
import { Track } from "livekit-client";
import '@livekit/components-styles';
import './StudyRoomCustom.css'; // 커스텀 CSS 파일
import React, { useState } from 'react';

const LIVEKIT_URL = "wss://api.studylink.store:443";

// 커스텀 컨트롤 바 컴포넌트
function CustomControlBar() {
  
  return (
    <div className="custom-control-bar">
      <ControlBar 
        controls={{ 
          microphone: true, 
          camera: true, 
          screenShare: true, 
          chat: true, 
          leave: true 
        }}
        variation="verbose" // 텍스트와 아이콘 모두 표시
      />
    </div>
  );
}

// 커스텀 참가자 타일
function CustomParticipantTile({ trackRef, ...props }) {
  return (
    <div className="custom-participant-container">
      <ParticipantTile trackRef={trackRef} {...props} />
      {/* 참가자별 스터디 상태 표시 */}
      <div className="study-status">
        <span className="status-indicator">📖</span>
        <span className="study-time">2h 30m</span>
      </div>
    </div>
  );
}

// 메인 화상회의 컴포넌트 (VideoConference 대신 커스텀)
function CustomVideoConference({ roomTitle }) {
  const [showChat, setShowChat] = useState(false);
  const [widgetState, setWidgetState] = useState({
    showChat: false,
    unreadMessages: 0,
  });

  // LiveKit hooks 사용
  const tracks = useTracks([
    { source: Track.Source.Camera, withPlaceholder: true },
    { source: Track.Source.ScreenShare, withPlaceholder: false },
  ]);

  const layoutContext = useLayoutContext();
  const focusTrack = usePinnedTracks(layoutContext)?.[0];
  const carouselTracks = tracks.filter(track => track !== focusTrack);

  return (
    <div className="custom-video-conference">
      {/* 헤더 */}
      <div className="study-room-header">
        <h2>Study Link</h2>
        <h2>{roomTitle}</h2>
        <div className="room-info">
          <span>참가자: {tracks.length}명</span>
        </div>
      </div>
 
      {/* 메인 비디오 영역 */}
      <div className="video-area">
        {!focusTrack ? (
          // 그리드 레이아웃
          <div className="grid-container">
            <GridLayout tracks={tracks}>
              <CustomParticipantTile />
            </GridLayout>
          </div>
        ) : (
          // 포커스 레이아웃 (화면공유 등)
          <div className="focus-container">
            <FocusLayoutContainer>
              <CarouselLayout tracks={carouselTracks}>
                <CustomParticipantTile />
              </CarouselLayout>
              <FocusLayout trackRef={focusTrack} />
            </FocusLayoutContainer>
          </div>
        )}
      </div>

      {/* 사이드바 - 스터디 도구들 */}
      <div className="study-sidebar">
        <div className="study-tools">
          {/* <h3>스터디 도구</h3>
          <button className="tool-btn">🍅 포모도로</button>
          <button className="tool-btn">📝 메모장</button>
          <button className="tool-btn">📊 진도율</button>
          <button className="tool-btn">🎯 목표설정</button> */}
        </div>
        
        {/* 참가자 목록 */}
        <div className="participants-list">
          <h3>참가자 ({tracks.length})</h3>
          {tracks.map((track, index) => (
            <div key={index} className="participant-item">
              <span className="participant-name">
                {track.participant.name || `참가자 ${index + 1}`}
              </span>
              <span className="participant-status">📖</span>
            </div>
          ))}
        </div>
      </div>

      {/* 커스텀 컨트롤 바 */}
      <CustomControlBar />

      {/* 채팅 (조건부 표시) */}
      {widgetState.showChat && (
        <div className="chat-container">
          <Chat />
        </div>
      )}

      {/* 오디오 렌더러 */}
      <RoomAudioRenderer />
      
      {/* 연결 상태 토스트 */}
      <ConnectionStateToast />
    </div>
  );
}

// 메인 컴포넌트
export default function StudyRoomEntry() {
  const { state } = useLocation();
  const token = state?.token;

  const roomName = state?.roomName ?? "기본 방 제목";
  console.log("LIVEKIT_URL", LIVEKIT_URL, "token", token);
  
  if (!token) {
    return <Navigate to="/study-room" replace />;
  }

  return (
    <div className="study-room-wrapper">
      <LiveKitRoom 
        data-lk-theme="default" 
        token={token} 
        serverUrl={LIVEKIT_URL} 
        connect={true} 
        video={true} 
        audio={true}
        // 추가 옵션들
        options={{
          adaptiveStream: true,
          dynacast: true,
          videoCaptureDefaults: {
            resolution: { width: 1280, height: 720 }
          }
        }}
      >
        <LayoutContextProvider>
          <CustomVideoConference roomTitle={roomName} />
        </LayoutContextProvider>
      </LiveKitRoom>
    </div>
  );
}