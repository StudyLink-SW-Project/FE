// src/pages/StudyRoomInside.jsx
import { useParams, useLocation, Link } from "react-router-dom";
import { Users } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { Room, RoomEvent, LocalVideoTrack } from "livekit-client";
import VideoComponent from "../components/VideoComponent";
import AudioComponent from "../components/AudioComponent";

/* LiveKit 서버 & 토큰 서버 URL */
const LIVEKIT_URL = import.meta.env.VITE_LIVEKIT_URL || "ws://localhost:7880/";
const APP_SERVER = import.meta.env.VITE_APP_SERVER || "http://localhost:6080/";

export default function StudyRoomInside() {
  const { id } = useParams();
  const { state } = useLocation();
  const token = state?.token;
  const participantName =
    state?.name || `Guest_${Math.random().toString(36).slice(2, 6)}`;

  const [room, setRoom] = useState(null);
  const [localTrack, setLocalTrack] = useState(null);
  const [remoteTracks, setRemoteTracks] = useState([]);
  const [chatLog, setChatLog] = useState([]);
  const [camEnabled, setCamEnabled] = useState(true); // 카메라 상태

  useEffect(() => {
    if (!token) return;

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

    (async () => {
      try {
        const res = await fetch(`${APP_SERVER}token`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ roomName: id, participantName }),
        });
        const { token: fetchedToken } = await res.json();

        await r.connect(LIVEKIT_URL, fetchedToken);
        await r.localParticipant.enableCameraAndMicrophone();

        // 로컬 비디오 트랙 꺼내기
        const camPub = Array.from(
          r.localParticipant.videoTrackPublications.values()
        ).find(p => p.track instanceof LocalVideoTrack);
        if (camPub) {
          setLocalTrack(camPub.track);
          setCamEnabled(true);
        }

        // 지연 퍼블리시 시에도 잡기
        r.localParticipant.on(RoomEvent.LocalTrackPublished, pub => {
          if (pub.track instanceof LocalVideoTrack) {
            setLocalTrack(pub.track);
            setCamEnabled(true);
          }
        });
      } catch (err) {
        console.error("LiveKit 연결 오류:", err);
      }
    })();

    return () => {
      r.disconnect();
      setLocalTrack(null);
      setRemoteTracks([]);
    };
  }, [id, token, participantName]);

  // 카메라 On/Off 토글
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
            <h3 className="text-center font-medium mb-2">
              참가자 수: {participantCount}
            </h3>
            <hr className="border-gray-300 mb-3" />
            <ul className="space-y-2">
              <li className="flex items-center gap-3">
                <span className="text-sm">{participantName} (나)</span>
              </li>
              {remoteTracks.map(t => (
                <li key={t.id} className="flex items-center gap-3">
                  <span className="text-sm">{t.id}</span>
                </li>
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
            {/* 카메라 On/Off 버튼 */}
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
