// src/pages/StudyRoomInside.jsx
import { useParams, useLocation, Link } from 'react-router-dom';
import { Users } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import {
  Room,
  RoomEvent,
  Track,
  LocalVideoTrack,
  RemoteTrackPublication,
} from 'livekit-client';
import VideoComponent from '../components/VideoComponent';
import AudioComponent from '../components/AudioComponent';

/* LiveKit 서버 & 토큰 서버 URL (필요시 .env.local 로 분리) */
const LIVEKIT_URL = import.meta.env.VITE_LIVEKIT_URL || 'ws://localhost:7880/';
const APP_SERVER   = import.meta.env.VITE_APP_SERVER  || 'http://localhost:6080/';

export default function StudyRoomInside() {
  const { id } = useParams();              // 방 ID
  const { state } = useLocation();               // ← 모달이 넘긴 값
  const token = state?.token;
  const participantName = state?.name || 'Guest';
  const [room, setRoom] = useState();      // livekit Room 인스턴스
  const [localTrack, setLocalTrack] = useState();              // LocalVideoTrack
  const [remoteTracks, setRemoteTracks] = useState([]);        // [{ pub, id }]
  const [chatLog, setChatLog] = useState([]);

  /* ───────── 실시간 연결 ───────── */
  useEffect(() => {
    (async () => {
      // 1) 토큰 발급
      const res = await fetch(`${APP_SERVER}token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomName: id, participantName: 'Guest' }),
      });
      const { token } = await res.json();

      // 2) 룸 연결
      const r = new Room();
      setRoom(r);

      r.on(RoomEvent.TrackSubscribed, (_t, pub, p) =>
        setRemoteTracks((v) => [...v, { pub, id: p.identity }]),
      );
      r.on(RoomEvent.TrackUnsubscribed, (_t, pub) =>
        setRemoteTracks((v) => v.filter((t) => t.pub.trackSid !== pub.trackSid)),
      );

      await r.connect(LIVEKIT_URL, token);
      await r.localParticipant.enableCameraAndMicrophone();
      const first = r.localParticipant.videoTrackPublications.values().next().value;
      setLocalTrack(first?.videoTrack);
    })();

    return () => room?.disconnect();
  }, [id]);

  /* ───────── 레이아웃 정보 예시 ───────── */
  const roomTitle = `공부합시다! (${id})`;
  const participantCount = 1 + remoteTracks.length;

  /* ───────── JSX 렌더링 ───────── */
  return (
    <div className="min-h-screen bg-[#282A36] text-white flex flex-col">
      {/* 상단 헤더 */}
      <header className="px-8 py-3 flex items-center border-b border-[#616680] gap-4">
        <h2 className="text-lg font-semibold">{roomTitle}</h2>
        <span className="flex items-center gap-1 text-sm">
          <Users className="w-4 h-4" /> {participantCount}
        </span>
      </header>

      {/* 본문 */}
      <div className="flex flex-1 overflow-hidden">
        {/* ── 비디오 그리드 ── */}
        <div className="grid grid-cols-2 gap-4 p-4 flex-1 overflow-auto">
          {/* 내 카메라 */}
          {localTrack && (
            <VideoComponent
              track={localTrack}
              participantIdentity={participantName}
              local
            />
          )}

          {/* 원격 카메라 / 오디오 */}
          {remoteTracks.map((t) =>
            t.pub.kind === 'video' ? (
              <VideoComponent
                key={t.pub.trackSid}
                track={t.pub.videoTrack}
                participantIdentity={t.id}
              />
            ) : (
              <AudioComponent key={t.pub.trackSid} track={t.pub.audioTrack} />
            )
          )}
        </div>

        {/* ── 우측 사이드바 (간단 채팅) ── */}
        <aside className="w-80 p-4 flex flex-col">
          <h3 className="text-center mb-2">채팅</h3>
          <div className="flex-1 overflow-auto space-y-1 mb-2">
            {chatLog.map((m, i) => (
              <div key={i}>{m}</div>
            ))}
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const txt = e.target.elements.msg.value.trim();
              if (!txt || !room) return;
              room.localParticipant.publishData(
                new TextEncoder().encode(txt),
                0,
              );
              setChatLog((v) => [...v, `나: ${txt}`]);
              e.target.reset();
            }}
          >
            <input
              name="msg"
              className="w-full bg-[#1D1F2C] border border-gray-600 px-2 py-1"
              placeholder="메시지 입력"
            />
          </form>

          {/* 컨트롤 (토글 미구현: 버튼만 예시) */}
          <div className="flex justify-center gap-3 mt-4">
            <button className="bg-green-500 p-3 rounded-full">🎤</button>
            <button className="bg-purple-500 p-3 rounded-full">📹</button>
            <Link to="/study-room">
              <button className="bg-red-500 p-3 rounded-full">🚪</button>
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
