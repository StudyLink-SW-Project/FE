// src/pages/StudyRoomInside.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useLocation, Navigate, Link } from 'react-router-dom';
import { Users } from 'lucide-react';
import { useSelector } from 'react-redux';
import { useTracks, Chat, VideoTrack, useRoomContext, TrackToggle, DisconnectButton } from '@livekit/components-react';
import { Track } from 'livekit-client';

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
  const localParticipant = room?.localParticipant;

  // 카메라 on/off 상태
  const [camEnabled, setCamEnabled] = useState(true);
  const [screenEnabled, setScreenEnabled] = useState(false);

  // 초기 카메라 상태 동기화
  useEffect(() => {
    if (localParticipant) {
      setCamEnabled(localParticipant.isCameraEnabled);
      setScreenEnabled(room.localParticipant.isScreenShareEnabled);
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
  const participantCount = tracks.length;

  const controlsConfig = {
    camera: true,
    microphone: true,
    screenShare: true,
    chat: true,
    settings: false,
  };
  return (
    <div className="min-h-screen bg-[#282A36] text-white flex flex-col">
      <header className="px-8 py-3 flex items-center border-b border-[#616680] gap-4">
        <h2 className="text-xl font-semibold">{roomTitle}</h2>
        <span className="flex items-center gap-1 text-sm">
          <Users className="w-4 h-4" /> {participantCount}
        </span>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* 비디오 그리드 */}
        <div className="grid grid-cols-2 gap-4 p-4 flex-1 overflow-auto">
          {gridTracks.map((trackRef) => (
            <div
              key={trackRef.publication.trackSid}
              className="bg-black rounded overflow-hidden aspect-video"
            >
              <VideoTrack
                trackRef={trackRef}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
          ))}
        </div>

        {/* 사이드바 */}
        <aside className="w-80 p-4 flex flex-col h-full space-y-4">
          <div className="bg-white text-black rounded-xl p-4 shadow">
            <h3 className="text-center font-medium mb-2">
              참가자 수: {participantCount}
            </h3>
            <hr className="border-gray-300 mb-3" />
            <p className="text-sm">{participantName} (나)</p>
          </div>

          {/* 채팅 */}
          <div className="flex-1 bg-white text-black rounded-xl shadow overflow-hidden">
            <Chat />
          </div>

          {/* 컨트롤 버튼 */}
          <div className="flex justify-center gap-4">
            {/* <button
              type="button"
              onClick={() => {
                // LiveKit LocalParticipant API 호출로 카메라 토글
                const newState = !camEnabled;
                room.localParticipant.setCameraEnabled(newState);
                setCamEnabled(newState);
              }}
              className={`p-3 cursor-pointer rounded-full ${camEnabled ? 'bg-purple-500' : 'bg-gray-500'}`}
            >
              📹
            </button> */}
            <TrackToggle
              source={Track.Source.Camera}
              showIcon
              onChange={(enabled, isUser) => {
                setCamEnabled(enabled);
                // 만약 직접 로컬 스토리지 등에 저장할 필요가 있다면 isUser 확인 후 처리
              }}
            >
              {camEnabled ? 'off' : 'on'}
            </TrackToggle>
             {/* 화면 공유 토글 */}
               <TrackToggle
                 source={Track.Source.ScreenShare}
                 captureOptions={{ audio: true, selfBrowserSurface: 'include' }}
                 showIcon
                 onChange={(enabled) => {
                   setScreenEnabled(enabled);
                 }}
               >
                 {screenEnabled ? '공유 중지' : '화면 공유'}
               </TrackToggle>
            <Link to="/study-room">
              {/* <button className="bg-red-500 p-3 rounded-full cursor-pointer">🚪</button> */}
              <DisconnectButton               
              >
                Leave room
              </DisconnectButton>
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}