import { useParams, useLocation, Link } from "react-router-dom";
import { Users } from "lucide-react";
import { useEffect, useState, useRef, useCallback } from "react";
import { Room, RoomEvent, LocalVideoTrack } from "livekit-client";
import VideoComponent from "../components/VideoComponent";
import AudioComponent from "../components/AudioComponent";
import { useSelector } from "react-redux";

// LIVEKIT_URL은 환경변수 또는 호스트명에 따라 한 번만 계산
const DEFAULT_LIVEKIT_URL = window.location.hostname === 'localhost'
  ? 'ws://localhost:7880/'
  : 'wss://api.studylink.store:443';
const LIVEKIT_URL = process.env.REACT_APP_LIVEKIT_URL || DEFAULT_LIVEKIT_URL;
const APP_SERVER = "https://api.studylink.store/";

export default function StudyRoomInside() {
  const { id } = useParams();
  const { state } = useLocation();
  const tokenFromModal = state?.token;
  const reduxUser = useSelector(s => s.auth.user);
  const participantName = state?.participantName || reduxUser?.userName || 'Guest';

  const roomRef = useRef(null);
  const [localTrack, setLocalTrack] = useState(null);
  const [remoteTracks, setRemoteTracks] = useState([]);
  const [participants, setParticipants] = useState([participantName]);
  const [chatLog, setChatLog] = useState([]);
  const [camEnabled, setCamEnabled] = useState(true);
  const [status, setStatus] = useState('idle'); // 'idle' | 'connecting' | 'joined' | 'error'

  // 이벤트 핸들러 정의
  const onTrackSubscribed = useCallback((_, pub, participant) => {
    setRemoteTracks(prev =>
      prev.some(t => t.pub.trackSid === pub.trackSid)
        ? prev
        : [...prev, { pub, id: participant.identity }]
    );
  }, []);

  const onTrackUnsubscribed = useCallback((_, pub) => {
    setRemoteTracks(prev => prev.filter(t => t.pub.trackSid !== pub.trackSid));
  }, []);

  const onParticipantConnected = useCallback(p => {
    setParticipants(prev =>
      prev.includes(p.identity) ? prev : [...prev, p.identity]
    );
  }, []);

  const onParticipantDisconnected = useCallback(p => {
    setParticipants(prev => prev.filter(id => id !== p.identity));
  }, []);

  const onLocalTrackPublished = useCallback(pub => {
    if (pub.track instanceof LocalVideoTrack) {
      setLocalTrack(pub.track);
      setCamEnabled(true);
      roomRef.current.localParticipant.off(
        RoomEvent.LocalTrackPublished,
        onLocalTrackPublished
      );
    }
  }, []);

  const onDataReceived = useCallback((payload, participant) => {
    const text = new TextDecoder().decode(payload);
    setChatLog(prev => [...prev, { author: participant.identity, text }]);
  }, []);

  // 라이브킷 방 연결 및 이벤트 등록
  useEffect(() => {
    if (!tokenFromModal) return;
    setStatus('connecting');
    const room = roomRef.current || new Room();
    roomRef.current = room;

    // 이벤트 등록
    room.on(RoomEvent.TrackSubscribed, onTrackSubscribed);
    room.on(RoomEvent.TrackUnsubscribed, onTrackUnsubscribed);
    room.on(RoomEvent.ParticipantConnected, onParticipantConnected);
    room.on(RoomEvent.ParticipantDisconnected, onParticipantDisconnected);
    room.localParticipant.on(RoomEvent.LocalTrackPublished, onLocalTrackPublished);
    room.on(RoomEvent.DataReceived, onDataReceived);

    (async () => {
      try {
        const token = tokenFromModal || (await (async () => {
          const res = await fetch(`${APP_SERVER}/api/v1/video/token`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ roomName: id, participantName }),
          });
          if (!res.ok) throw new Error("토큰 서버 오류");
          const { token } = await res.json();
          return token;
        })());

        await room.connect(LIVEKIT_URL, token);
        setStatus('joined');

        // 기존 참가자 목록 초기화
        const existing = Array.from(room.participants.values()).map(p => p.identity);
        setParticipants([participantName, ...existing]);

        // 카메라·마이크 퍼블리시
        await room.localParticipant.enableCameraAndMicrophone();

        // 이미 퍼블리시된 비디오 트랙 찾기
        const camPub = Array.from(
          room.localParticipant.videoTrackPublications.values()
        ).find(p => p.track instanceof LocalVideoTrack);
        if (camPub) {
          setLocalTrack(camPub.track);
          setCamEnabled(true);
        }
      } catch (err) {
        console.error("LiveKit 연결 오류:", err);
        setStatus('error');
      }
    })();

    return () => {
      // 이벤트 해제 및 방 종료
      room.off(RoomEvent.TrackSubscribed, onTrackSubscribed);
      room.off(RoomEvent.TrackUnsubscribed, onTrackUnsubscribed);
      room.off(RoomEvent.ParticipantConnected, onParticipantConnected);
      room.off(RoomEvent.ParticipantDisconnected, onParticipantDisconnected);
      room.localParticipant.off(RoomEvent.LocalTrackPublished, onLocalTrackPublished);
      room.off(RoomEvent.DataReceived, onDataReceived);
      room.disconnect();
    };
  }, [id, tokenFromModal, participantName,
      onTrackSubscribed, onTrackUnsubscribed,
      onParticipantConnected, onParticipantDisconnected,
      onLocalTrackPublished, onDataReceived]);

  // 카메라 토글
  const toggleCamera = useCallback(() => {
    const room = roomRef.current;
    if (!room) return;
    setCamEnabled(prev => {
      room.localParticipant.setCameraEnabled(!prev);
      return !prev;
    });
  }, []);

  // 상태에 따른 UI
  if (status === 'connecting') return <div>연결 중...</div>;
  if (status === 'error') return <div>방 입장에 실패했습니다.</div>;

  const participantCount = participants.length;
  const cols = Math.min(participantCount, 3);
  const gridClass = cols === 1 ? 'grid-cols-1' : cols === 2 ? 'grid-cols-2' : 'grid-cols-3';
  const roomTitle = `공부합시다! (${id})`;

  return (
    <div className="min-h-screen bg-[#282A36] text-white flex flex-col">
      <header className="px-8 py-3 flex items-center border-b border-[#616680] gap-4">
        <h2 className="text-xl font-semibold">{roomTitle}</h2>
        <span className="flex items-center gap-1 text-sm">
          <Users className="w-4 h-4" /> {participantCount}
        </span>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <div className={`grid ${gridClass} gap-4 p-4 flex-1 overflow-auto`}>
          {localTrack && (
            <VideoComponent track={localTrack} participantIdentity={participantName} local />
          )}
          {remoteTracks
            .filter(t => t.pub.kind === "video")
            .map(t => (
              <VideoComponent
                key={t.pub.trackSid}
                track={t.pub.videoTrack}
                participantIdentity={t.id}
              />
            ))}
        </div>

        <aside className="w-80 p-4 flex flex-col h-full space-y-4">
          <div className="bg-white text-black rounded-xl p-4 shadow">
            <h3 className="text-center font-medium mb-2">참가자 수: {participantCount}</h3>
            <hr className="border-gray-300 mb-3" />
            <ul className="space-y-2">
              {participants.map(id => (
                <li key={id} className="flex items-center gap-3">
                  <span className="text-sm">{id}{id===participantName?" (나)":""}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white text-black rounded-xl p-4 flex flex-col shadow overflow-hidden">
            <h3 className="text-center font-medium mb-2">메시지</h3>
            <hr className="border-gray-300 mb-3" />
            <div className="h-80 overflow-auto mb-3 space-y-2">
              {chatLog.length === 0 ? (
                <p className="text-gray-500 italic">아직 대화가 없습니다.</p>
              ) : (
                chatLog.map((m, i) => (
                  <div key={i}>
                    <span className="font-semibold">{m.author}: </span>
                    <span>{m.text}</span>
                  </div>
                ))
              )}
            </div>
            <form
              className="flex gap-1"
              onSubmit={e => {
                e.preventDefault();
                const txt = e.target.elements.msg.value.trim();
                const room = roomRef.current;
                if (!txt || !room) return;
                room.localParticipant.publishData(new TextEncoder().encode(txt), 0);
                setChatLog(prev => [...prev, { author: '나', text: txt }]);
                e.target.reset();
              }}
            >
              <input
                name="msg"
                type="text"
                placeholder="메시지를 입력하세요"
                className="flex-1 border border-gray-300 rounded-l px-3 py-2 outline-none"
              />
              <button
                type="submit"
                className="bg-black text-white px-3 py-2 rounded-r hover:bg-gray-800 transition whitespace-nowrap text-center"
              >
                전송
              </button>
            </form>
          </div>

          <div className="flex justify-center gap-4">
            <button
              onClick={toggleCamera}
              className={`p-3 rounded-full ${camEnabled ? "bg-purple-500" : "bg-gray-500"}`}
            >
              📹
            </button>
            <Link to="/study-room">
              <button className="bg-red-500 p-3 rounded-full">🚪</button>
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
