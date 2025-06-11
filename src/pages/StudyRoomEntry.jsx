// src/pages/StudyRoomEntry.jsx
// import { Navigate, useLocation, useNavigate } from "react-router-dom";
// import { 
//   LiveKitRoom, 
//   GridLayout, 
//   ParticipantTile, 
//   FocusLayout,
//   FocusLayoutContainer,
//   CarouselLayout,
//   ControlBar,
//   Chat,
//   RoomAudioRenderer,
//   ConnectionStateToast,
//   useTracks,
//   usePinnedTracks,
//   useLayoutContext,
//   LayoutContextProvider,
//   useRoomContext,
//   DisconnectButton,
//   useParticipants
// } from "@livekit/components-react";
// import { Track, ConnectionState } from "livekit-client";
// import '@livekit/components-styles';
// import './StudyRoomCustom.css'; // 커스텀 CSS 파일
// import React, { useState, useEffect } from 'react';

// const LIVEKIT_URL = "wss://api.studylink.store:443";

// // 커스텀 Leave 버튼 컴포넌트
// function CustomLeaveButton() {
//   const navigate = useNavigate();
//   const room = useRoomContext();

//   const handleLeave = async () => {
//     try {
//       // LiveKit 방 연결 해제
//       await room.disconnect();
//       // 페이지 이동
//       navigate('/study-room', { replace: true });
//     } catch (error) {
//       console.error('Leave 중 오류 발생:', error);
//       // 오류가 발생해도 페이지는 이동
//       navigate('/study-room', { replace: true });
//     }
//   };

//   return (
//     <button 
//       className="lk-button lk-disconnect-button" 
//       onClick={handleLeave}
//       aria-label="방 나가기"
//     >
//       <span className="lk-button-icon"/>
//       나가기
//     </button>
//   );
// }

// // 커스텀 채팅 버튼 컴포넌트
// function CustomChatButton({ isOpen, onClick, unreadCount = 0 }) {
//   return (
//     <button 
//       className={`lk-button lk-chat-toggle ${isOpen ? 'lk-chat-toggle-open' : ''}`}
//       onClick={onClick}
//       aria-label={isOpen ? '채팅 닫기' : '채팅 열기'}
//     >
//       <span className="lk-button-icon"/>
//       <span className="lk-button-label">채팅</span>
//       {unreadCount > 0 && (
//         <span className="lk-chat-unread-indicator">
//           {unreadCount}
//         </span>
//       )}
//     </button>
//   );
// }

// // 커스텀 컨트롤 바 컴포넌트
// function CustomControlBar({ onChatToggle, isChatOpen, unreadMessages }) {
//   return (
//     <div className="custom-control-bar">
//       <ControlBar 
//         controls={{ 
//           microphone: true, 
//           camera: true, 
//           screenShare: true, 
//           chat: false, // 기본 채팅 버튼 비활성화
//           leave: false // 기본 leave 버튼 비활성화
//         }}
//         variation="verbose" // 텍스트와 아이콘 모두 표시
//       />
//       {/* 커스텀 채팅 버튼 추가 */}
//       <CustomChatButton 
//         isOpen={isChatOpen}
//         onClick={onChatToggle}
//         unreadCount={unreadMessages}
//       />
//       {/* 커스텀 Leave 버튼 추가 */}
//       <CustomLeaveButton />
//     </div>
//   );
// }

// // 커스텀 참가자 타일
// function CustomParticipantTile({ trackRef, ...props }) {
//   return (
//     <div className="custom-participant-container">
//       <ParticipantTile trackRef={trackRef} {...props} />
//       {/* 참가자별 스터디 상태 표시 */}
//       <div className="study-status">
//         <span className="status-indicator">📖</span>
//         <span className="study-time">2h 30m</span>
//       </div>
//     </div>
//   );
// }

// // 메인 화상회의 컴포넌트 (VideoConference 대신 커스텀)
// function CustomVideoConference({ roomTitle }) {
//   const [widgetState, setWidgetState] = useState({
//     showChat: false,
//     unreadMessages: 0,
//   });
//   const navigate = useNavigate();
//   const room = useRoomContext();

//   // 채팅 토글 함수
//   const handleChatToggle = () => {
//     setWidgetState(prev => ({
//       ...prev,
//       showChat: !prev.showChat,
//       unreadMessages: prev.showChat ? 0 : prev.unreadMessages // 채팅을 열면 읽지 않은 메시지 카운트 리셋
//     }));
//   };


//   // 새 메시지 수신 감지 (채팅이 닫혀있을 때 카운트)
//   useEffect(() => {
//     if (!room) return;

//     const handleDataReceived = (payload, participant) => {
//       // 채팅 메시지인지 확인 (LiveKit의 채팅 메시지는 보통 특정 형식을 가집니다)
//       try {
//         const data = JSON.parse(new TextDecoder().decode(payload));
//         if (data.type === 'chat' && !widgetState.showChat) {
//           setWidgetState(prev => ({
//             ...prev,
//             unreadMessages: prev.unreadMessages + 1
//           }));
//         }
//       } catch (error) {
//         // JSON이 아닌 데이터는 무시
//       }
//     };

//     room.on('dataReceived', handleDataReceived);

//     return () => {
//       room.off('dataReceived', handleDataReceived);
//     };
//   }, [room, widgetState.showChat]);

//   // LiveKit hooks 사용
//   const tracks = useTracks([
//     { source: Track.Source.Camera, withPlaceholder: true },
//     { source: Track.Source.ScreenShare, withPlaceholder: false },
//   ]);

//   const layoutContext = useLayoutContext();
//   const focusTrack = usePinnedTracks(layoutContext)?.[0];
//   const carouselTracks = tracks.filter(track => track !== focusTrack);
//   const participants = useParticipants();

//   return (
//     <div className="custom-video-conference">
//       {/* 헤더 */}
//       <div className="study-room-header">
//         <h2>Study Link</h2>
//         <h2>{roomTitle}</h2>
//         <div className="room-info">
//           <span>참가자: {participants.length}명</span>
//         </div>
//       </div>
 
//       {/* 메인 비디오 영역 */}
//       <div className="video-area">
//         {!focusTrack ? (
//           // 그리드 레이아웃
//           <div className="grid-container">
//             <GridLayout tracks={tracks}>
//               <CustomParticipantTile />
//             </GridLayout>
//           </div>
//         ) : (
//           // 포커스 레이아웃 (화면공유 등)
//           <div className="focus-container">
//             <FocusLayoutContainer>
//               <CarouselLayout tracks={carouselTracks}>
//                 <CustomParticipantTile />
//               </CarouselLayout>
//               <FocusLayout trackRef={focusTrack} />
//             </FocusLayoutContainer>
//           </div>
//         )}
//       </div>

//       {/* 사이드바 - 스터디 도구들 */}
//       <div className="study-sidebar">
//         <div className="study-tools">
//           {/* <h3>스터디 도구</h3>
//           <button className="tool-btn">🍅 포모도로</button>
//           <button className="tool-btn">📝 메모장</button>
//           <button className="tool-btn">📊 진도율</button>
//           <button className="tool-btn">🎯 목표설정</button> */}
//         </div>
        
//         {/* 참가자 목록 */}
//         <div className="participants-list">
//           <h3>참가자 ({participants.length})</h3>
//           {participants.map(participant => (
//             <div key={participant.sid} className="participant-item">
//               <span>{participant.name}</span>
//               </div>
//             ))}
//         </div>
//       </div>

//       {/* 커스텀 컨트롤 바 */}
//       <CustomControlBar 
//         onChatToggle={handleChatToggle}
//         isChatOpen={widgetState.showChat}
//         unreadMessages={widgetState.unreadMessages}
//       />

//       {/* 채팅 (조건부 표시) */}
//       {widgetState.showChat && (
//         <div className="chat-container">
//           <div className="chat-header">
//             <h3>채팅</h3>
//             <button 
//               className="chat-close-btn"
//               onClick={() => setWidgetState(prev => ({ ...prev, showChat: false }))}
//             >
//               ✕
//             </button>
//           </div>
//           <Chat />
//         </div>
//       )}

//       {/* 오디오 렌더러 */}
//       <RoomAudioRenderer />
      
//       {/* 연결 상태 토스트 */}
//       <ConnectionStateToast />
//     </div>
//   );
// }

// // 메인 컴포넌트
// export default function StudyRoomEntry() {
//   const { state } = useLocation();
//   const token = state?.token;

//   const roomName = state?.roomName ?? "기본 방 제목";
//   console.log("LIVEKIT_URL", LIVEKIT_URL, "token", token);
  
//   if (!token) {
//     return <Navigate to="/study-room" replace />;
//   }

//   return (
//     <div className="study-room-wrapper">
//       <LiveKitRoom 
//         data-lk-theme="default" 
//         token={token} 
//         serverUrl={LIVEKIT_URL} 
//         connect={true} 
//         video={true} 
//         audio={true}
//         // 추가 옵션들
//         options={{
//           adaptiveStream: true,
//           dynacast: true,
//           videoCaptureDefaults: {
//             resolution: { width: 1280, height: 720 }
//           }
//         }}
//       >
//         <LayoutContextProvider>
//           <CustomVideoConference roomTitle={roomName} />
//         </LayoutContextProvider>
//       </LiveKitRoom>
//     </div>
//   );
// }


import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { 
  LiveKitRoom, 
  VideoConference
} from "@livekit/components-react";
import '@livekit/components-styles';
import './StudyRoomCustom.css';
import { User } from "lucide-react";

// LiveKit 서버 URL
const LIVEKIT_URL = "wss://api.studylink.store:443";
// 백엔드 방 설정 저장 API 베이스
const API = import.meta.env.VITE_APP_SERVER;

export default function StudyRoomEntry() {
  const { state } = useLocation();
  const token = state?.token;
  const roomName = state?.roomName;
  const password = state?.password;
  const img = state?.img;
  const navigate = useNavigate();

  if (!token) {
    return <Navigate to="/study-room" replace />;
  }

  // 1) 연결 성공 후 호출할 콜백
  const handleConnected = async () => {
    try {
      const res = await fetch(`${API}room/set`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomName: String(roomName),
          // 필요하다면 password, roomImage 등 다른 필드도 추가
          password: String(password),      
          roomImage: String(img)
        }),
      });
      if (!res.ok) {
        throw new Error("방 설정 저장 실패");
      }
      // 저장이 성공했을 때 추가 로직이 필요하면 여기에…
    } catch (err) {
      console.error(err);
      // 사용자에게 에러 메시지를 보여주고 싶다면 상태로 관리하셔도 좋습니다.
    }
  };

  return (
    <div>
      <div className="bg-[#0f172a]">
        <div className="hidden sm:flex flex justify space-x-3 items-center h-11 ml-15">
          <img 
            src="/logo_white.png" 
            alt="Study Link Logo" 
            className="h-11 mt-5" 
          />
          <h1 className="text-white text-2xl flex justify-center items-center mt-5">
            {roomName}
          </h1>
          <h1 className="text-gray-500 text-xl flex justify-center items-center mt-4">
            |
          </h1>
        </div>
      </div>
      
      <div style={{ 
        height: '95vh',  
        width: '100vw',   
        display: 'flex',
        flexDirection: 'column'
      }}>
        <LiveKitRoom
          data-lk-theme="default"
          serverUrl={LIVEKIT_URL}
          token={token}
          connect={true}
          audio={true}
          video={true}
          onConnected={handleConnected}      // ← 여기에 추가
          onDisconnected={() => {
            navigate('/study-room', { replace: true });
          }}
          onError={err => console.error("LiveKit 오류:", err)}
        >
          <VideoConference/>
        </LiveKitRoom>
      </div>
    </div>
  );
}
