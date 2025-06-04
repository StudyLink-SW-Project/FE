// src/pages/StudyRoomInside.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useLocation, Navigate, Link } from 'react-router-dom';
import { Users, LogOut } from 'lucide-react';
import { useSelector } from 'react-redux';
// import { useTracks, Chat, VideoTrack, useRoomContext, TrackToggle, DisconnectButton, useParticipants, useLocalParticipant } from '@livekit/components-react';
import { useTracks } from '../livekit-src/hooks/useTracks'
import { useRoomContext } from '../livekit-src/context/room-context'
import { useParticipants } from '../livekit-src/hooks/useParticipants'
import { useLocalParticipant } from '../livekit-src/hooks/useLocalParticipant'

import { Track } from 'livekit-client';
import { VideoConference } from '../livekit-src/prefabs/VideoConference';

export default function StudyRoomInside() {
  const { id } = useParams();
  const { state } = useLocation();
  const token = state?.token;
  if (!token) {
    return <Navigate to="/study-room" replace />;
  }

  const reduxUser = useSelector((state) => state.auth.user);
  const participantName = reduxUser?.userName || 'Guest';

  // LiveKit camera tracks for local and remote
  const tracks = useTracks(
    [
      { source: Track.Source.Camera,      withPlaceholder: false },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: true }
  );

  const { room } = useRoomContext();
  const { localParticipant } = useLocalParticipant();
  const participants = useParticipants();

  // “나”를 제외한 참가자만
  const otherParticipants = participants.filter(
    p => p.identity !== localParticipant?.identity
  );
  
  // 카메라 on/off 상태
  const [camEnabled, setCamEnabled] = useState(true);
  const [screenEnabled, setScreenEnabled] = useState(false);

  // 초기 카메라 상태 동기화
  useEffect(() => {
    if (localParticipant) {
      setCamEnabled(localParticipant.isCameraEnabled);
      setScreenEnabled(localParticipant.isScreenShareEnabled);
    }
  }, [room?.localParticipant]);

  // 카메라 트랙과 화면 공유 트랙 분리
  const cameraTracks = tracks.filter(
    t => t.publication.source === Track.Source.Camera
  );
  const screenTracks = tracks.filter(
    t => t.publication.source === Track.Source.ScreenShare
  );
  // 화면 공유 중이면 screenTracks, 그렇지 않으면 cameraTracks 사용
  const gridTracks = screenEnabled ? screenTracks : cameraTracks;

  const roomTitle = id;
  const participantCount = otherParticipants.length + 1;

  const controlsConfig = {
    camera: true,
    microphone: true,
    screenShare: true,
    chat: true,
    settings: false,
  };
  return (
    <VideoConference
      roomTitle={roomTitle}
    />
    // <div className="min-h-screen bg-[#282A36] text-white flex flex-col">
    //   <header className="px-8 py-3 flex items-center justify-between border-b border-[#616680]">
    //     <h2 className="text-xl font-semibold">{roomTitle}</h2>
    //     {/* 컨트롤 버튼 */}
    //     <div className="flex justify-center gap-1 -mr-5">
    //       <TrackToggle
    //         source={Track.Source.Camera}
    //         showIcon
    //         onChange={(enabled) => {
    //           setCamEnabled(enabled);
    //         }}
    //         className="cursor-pointer"
    //       >   
    //         {camEnabled ? '켜기' : '끄기'}
    //       </TrackToggle>

    //       {/* 화면 공유 토글 */}
    //       <TrackToggle
    //         source={Track.Source.ScreenShare}
    //         captureOptions={{ audio: true, selfBrowserSurface: 'include' }}
    //         showIcon
    //         onChange={(enabled) => {
    //           setScreenEnabled(enabled);
    //         }}
    //         className="cursor-pointer"
    //       >
    //         {screenEnabled ? '중지' : '공유'}
    //       </TrackToggle>

    //       {/* 나가기 버튼 */}
    //       <Link to="/study-room" className="text-red-400">
    //         <DisconnectButton                   
    //         >
    //         <LogOut className="w-5 h-5" />
    //         <span className="font-normal">
    //           나가기
    //         </span>
    //         </DisconnectButton>
    //       </Link>
    //     </div>
    //   </header>

    //   <div className="flex flex-1 overflow-hidden">
    //     {/* 비디오 그리드 */}
    //     <div className="grid grid-cols-2 gap-4 p-4 flex-1 overflow-auto">
    //       {gridTracks.map((trackRef) => (
    //         <div
    //           key={trackRef.publication.trackSid}
    //           className="bg-black rounded overflow-hidden aspect-video"
    //         >
    //           <VideoTrack
    //             trackRef={trackRef}
    //             style={{ width: '100%', height: '100%', objectFit: 'cover' }}
    //           />
    //         </div>
    //       ))}
    //     </div>

    //     {/* 사이드바 */}
    //     <aside className="w-80 p-4 flex flex-col h-full space-y-4">
    //       <div className="bg-white text-black rounded-xl p-4 shadow">
    //         <h3 className="text-center font-medium mb-2">
    //           참가자 수: {participantCount}
    //         </h3>
    //         <hr className="border-gray-300 mb-3" />
    //         <ul className="space-y-2">
    //           {/* “나” */}
    //           <li className="flex items-center gap-3">
    //             <span className="text-sm">{participantName} (나)</span>
    //           </li>
    //           {/* 나를 제외한 참가자들 */}
    //           {otherParticipants.map(p => (
    //             <li key={p.identity} className="flex items-center gap-3">
    //               <span className="text-sm">{p.identity}</span>
    //             </li>
    //           ))}
    //         </ul>
    //       </div>

    //       {/* 채팅 */}
    //       <div className="flex-1 bg-white text-black rounded-xl shadow overflow-hidden">
    //         <Chat
    //           style={{ width: '300px', maxWidth: '100%', height: '600px', maxHeight:'100%' }}
    //           className="lk-chat custom-chat"
    //         />
    //       </div>
    //     </aside>
    //   </div>
    // </div>
  );
}