// src/components/JoinRoomModal.jsx
import { useState, useEffect } from "react";
import { Users, Lock, Eye, EyeOff, X } from "lucide-react";
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

export default function JoinRoomModal({ room, isOpen, onClose, onEnter }) {
  // 리덕스에서 유저 정보 가져오기
  const user = useSelector(state => state.auth.user);
  const userName = user?.userName || `Guest_${Math.random().toString(36).slice(2,6)}`;
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState("");

  // 모달 열 때마다 초기화
  useEffect(() => {
    if (isOpen) {
      setPassword("");
      setShowPwd(false);
      setError("");
    }
  }, [isOpen]);

  if (!isOpen || !room) return null;

  async function handleEnter(e) {
    e.preventDefault();
    setError("");
    try {
      // 1) 토큰 발급
      const res = await fetch(`${APP_SERVER}api/v1/video/token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomName: String(room.id), // "0"도 허용되도록 String
          participantName: userName,
        }),
      });
      if (!res.ok) throw new Error("토큰 서버 오류");
      const { token } = await res.json();

      // 2) 발급된 토큰과 닉네임을 부모로 전달
      onEnter(String(room.id), token, userName);
      onClose();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-[#1D1F2C] rounded-xl w-full max-w-sm p-6 relative text-white">
        {/* 닫기 */}
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-gray-200">
          <X className="w-5 h-5" />
        </button>

        {/* 제목/인원 */}
        <h2 className="text-xl font-semibold mb-2">{room.title}</h2>
        <div className="flex items-center mb-4 text-sm">
          <Users className="w-5 h-5 mr-1" />
          {room.participants}/{room.maxParticipants}
        </div>

        {/* 이미지 */}
        <img
          src={room.imageSrc}
          alt={room.title}
          className="w-full h-32 object-cover rounded-md mb-4"
        />

        {/* 설명 */}
        <p className="text-gray-300 mb-6">{room.subtitle}</p>

        <form onSubmit={handleEnter}>

        {/* 비밀번호 입력 (잠긴 방만) */}
        {room.isLocked && (
          <div className="mb-4">
            <label className="flex items-center text-sm mb-1 text-gray-400">
              <Lock className="w-4 h-4 mr-1" /> 비밀번호
            </label>
            <div className="flex items-center border-b border-gray-600">
              <input
                type={showPwd ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호를 입력하세요"
                className="flex-1 bg-transparent py-2 outline-none placeholder-gray-500 text-white"
                required
              />
              <button
                type="button"
                onClick={() => setShowPwd((v) => !v)}
                className="text-gray-500"
              >
                {showPwd ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
        )}

          {error && <p className="text-red-400 mb-2">{error}</p>}

          {/* 입장 버튼 */}
          <button
            type="submit"
            className="w-full py-2 bg-blue-600 hover:bg-blue-500 rounded-full text-white font-medium transition"
          >
            입장
          </button>
        </form>
      </div>
    </div>
  );
}
