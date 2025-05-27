// src/pages/StudyRoomInside.jsx
import { useParams, useLocation, Link } from "react-router-dom";
import { Users } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { Room, RoomEvent, LocalVideoTrack } from "livekit-client";
import VideoComponent from "../components/VideoComponent";
import AudioComponent from "../components/AudioComponent";
import { useSelector } from "react-redux";

  // 토큰 발급 서버
  let APP_SERVER = "https://api.studylink.store/";
  // LiveKit WebSocket URL
  let LIVEKIT_URL = ""; 

    // If LIVEKIT_URL is not configured, use default value from OpenVidu Local deployment
    if (!LIVEKIT_URL) {
        if (window.location.hostname === "localhost") {
            LIVEKIT_URL = "ws://localhost:7880/";
        } else {
            LIVEKIT_URL = "wss://api.studylink.store:443";
        }
    }
    
export default function StudyRoomInside() {
  const { id } = useParams();
  const { state } = useLocation();
  const tokenFromModal = state?.token;  // 모달에서 넘어온 토큰
  const reduxUser = useSelector(state => state.auth.user);
  const participantName = state?.participantName || reduxUser?.userName || 'Guest';

  const [room, setRoom] = useState(null);
  const [localTrack, setLocalTrack] = useState(null);
  const [remoteTracks, setRemoteTracks] = useState([]);
  const [chatLog, setChatLog] = useState([]);
  const [camEnabled, setCamEnabled] = useState(true);
  const [participants, setParticipants] = useState([participantName]);

  useEffect(() => {
    if (!tokenFromModal) return;
    const r = new Room();
    setRoom(r);

    r.on(RoomEvent.TrackSubscribed, (_t, pub, participant) =>
      setRemoteTracks(prev => [...prev, { pub, id: participant.identity }])
    );
    r.on(RoomEvent.TrackUnsubscribed, (_t, pub) =>
      setRemoteTracks(prev =>
        prev.filter(t => t.pub.trackSid !== pub.trackSid)
      )
    );

    // 참가자 연결/해제
    r.on(RoomEvent.ParticipantConnected, p => {
      setParticipants(prev =>
        prev.includes(p.identity) ? prev : [...prev, p.identity]
      );
    });
    r.on(RoomEvent.ParticipantDisconnected, p => {
      setParticipants(prev =>
        prev.filter(id => id !== p.identity)
      );
    });

    (async () => {
      try {
        // 1) 모달에서 넘어온 토큰을 우선 사용, 없으면 백엔드 호출
        const livekitToken = tokenFromModal ?? await (async () => {
          const res = await fetch(`${APP_SERVER}/api/v1/video/token`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ roomName: id, participantName }),
          });
          if (!res.ok) throw new Error("토큰 서버 오류");
          const { token } = await res.json();
          return token;
        })();

        // 2) LiveKit 서버 연결
        await r.connect(LIVEKIT_URL, livekitToken);
        // 3) 카메라·마이크 퍼블리시
        await r.localParticipant.enableCameraAndMicrophone();

        // 4) 퍼블리시된 로컬 비디오 트랙 획득
        const camPub = Array.from(
          r.localParticipant.videoTrackPublications.values()
        ).find(p => p.track instanceof LocalVideoTrack);
        if (camPub) {
          setLocalTrack(camPub.track);
          setCamEnabled(true);
        }

        // 5) 이후 퍼블리시되는 트랙도 동일하게 처리
        const handleLocalPub = pub => {
          if (pub.track instanceof LocalVideoTrack) {
            setLocalTrack(pub.track);
            setCamEnabled(true);
            r.localParticipant.off(RoomEvent.LocalTrackPublished, handleLocalPub);
          }
        };
        r.localParticipant.on(RoomEvent.LocalTrackPublished, handleLocalPub);
      } catch (err) {
        console.error("LiveKit 연결 오류:", err);
      }
    })();

    return () => {
    // 기존 cleanup 외에
    r.off(RoomEvent.ParticipantConnected);
    r.off(RoomEvent.ParticipantDisconnected);
    r.disconnect();
  };
}, [id, tokenFromModal, participantName]);

  const toggleCamera = useCallback(() => {
    if (!room) return;
    room.localParticipant.setCameraEnabled(!camEnabled);
    setCamEnabled(prev => !prev);
  }, [room, camEnabled]);

  const roomTitle = `공부합시다! (${id})`;
  const participantCount = 1 + remoteTracks.length;

  return (
    <div className="min-h-screen bg-[#282A36] text-white flex flex-col">
      {/* 상단 방 정보 */}
      <header className="px-8 py-3 flex items-center border-b border-[#616680] gap-4">
        <h2 className="text-xl font-semibold">{roomTitle}</h2>
        <span className="flex items-center gap-1 text-sm">
          <Users className="w-4 h-4" /> {participantCount}
        </span>
      </header>

      {/* 본문: 비디오 그리드 + 우측 사이드바 */}
      <div className="flex flex-1 overflow-hidden">
        {/* 비디오 그리드 */}
        <div className="grid grid-cols-2 gap-4 p-4 flex-1 overflow-auto">
          {localTrack && (
            <VideoComponent
              track={localTrack}
              participantIdentity={participantName}
              local
            />
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

        {/* 우측 사이드바 */}
        <aside className="w-80 p-4 flex flex-col h-full space-y-4">
          {/* 참가자 카드 */}
          <div className="bg-white text-black rounded-xl p-4 shadow">
            {/* 참가자 수 */}
            <h3>참가자 수: {participantCount}</h3>
            <ul>
              {participants.map(id => (
                <li key={id}>{id === participantName ? `${id} (나)` : id}</li>
              ))}
            </ul>
          </div>

          {/* 메시지 카드 */}
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
                if (!txt || !room) return;
                room.localParticipant.publishData(
                  new TextEncoder().encode(txt),
                  0
                );
                setChatLog(prev => [...prev, { author: "나", text: txt }]);
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

          {/* 컨트롤 버튼 */}
          <div className="flex justify-center gap-4">
            <button
              onClick={toggleCamera}
              className={`p-3 rounded-full ${
                camEnabled ? "bg-purple-500" : "bg-gray-500"
              }`}
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
