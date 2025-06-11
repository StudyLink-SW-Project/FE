import { useState, useEffect } from "react";
import { Users, Lock, Eye, EyeOff, X } from "lucide-react";
import { useSelector } from "react-redux";

// 토큰 발급 서버
let APP_SERVER = "https://api.studylink.store/";

export default function JoinRoomModal({ room, isOpen, onClose, onEnter }) {
  const user = useSelector(state => state.auth.user);
  const userName = user?.userName || `Guest_${Math.random().toString(36).slice(2,6)}`;
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState("");
  const [isEntering, setIsEntering] = useState(false);

  // 모달 열 때마다 초기화
  useEffect(() => {
    if (isOpen) {
      setPassword("");
      setShowPwd(false);
      setError("");
      setIsEntering(false);
    }
  }, [isOpen]);

  if (!isOpen || !room) return null;

  async function handleEnter(e) {
    e.preventDefault();
    setError("");
    setIsEntering(true);
    
    try {
      // ✅ 프론트엔드에서 비밀번호 검증
      if (room.isLocked) {
        if (!password.trim()) {
          throw new Error("비밀번호를 입력해주세요.");
        }
        
        if (password.trim() !== room.password.trim()) {
          throw new Error("비밀번호가 틀렸습니다.");
        }
      }

      // ✅ 비밀번호 검증 통과 후 토큰 발급
      const res = await fetch(`${APP_SERVER}api/v1/video/token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomName: String(room.title),
          participantName: userName,
        }),
      });
      
      if (!res.ok) throw new Error("토큰 서버 오류");
      const { token } = await res.json();

      // ✅ 입장 처리
      onEnter(String(room.title), token, password, room.imageNumber);
      onClose();
      
    } catch (err) {
      setError(err.message);
    } finally {
      setIsEntering(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-xs p-4">
      <div className="bg-[#1D1F2C] rounded-xl w-full max-w-sm mx-4 p-4 sm:p-6 relative text-white">
        {/* 닫기 */}
        <button 
          onClick={onClose} 
          className="absolute top-3 right-3 p-2 text-gray-400 hover:text-gray-200 hover:bg-gray-700 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* 제목/인원 */}
        <h2 className="text-lg sm:text-xl font-semibold mb-2 pr-10">{room.title}</h2>
        <div className="flex items-center mb-4 text-sm">
          <Users className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
          <span className="text-sm sm:text-base">{room.participants}/{room.maxParticipants}</span>
        </div>

        {/* 이미지 */}
        <img
          src={room.imageSrc}
          alt={room.title}
          className="w-full h-60 sm:h-70 object-cover rounded-md mb-4"
        />

        {/* 설명 */}
        <p className="text-gray-300 mb-4 sm:mb-6 text-sm sm:text-base">{room.subtitle}</p>

        <form onSubmit={handleEnter}>
          {/* ✅ 비밀번호 입력 (잠긴 방만) */}
          {room.isLocked && (
            <div className="mb-4 sm:mb-6">
              <label className="flex items-center text-sm mb-2 text-gray-400">
                <Lock className="w-4 h-4 mr-2" /> 비밀번호
              </label>
              <div className="flex items-center border-b border-gray-600 pb-2">
                <input
                  type={showPwd ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="비밀번호를 입력하세요"
                  className="flex-1 bg-transparent py-2 outline-none placeholder-gray-500 text-white text-sm sm:text-base"
                  required
                  disabled={isEntering}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((v) => !v)}
                  className="text-gray-500 ml-2"
                  disabled={isEntering}
                >
                  {showPwd ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
                </button>
              </div>
            </div>
          )}

          {error && <p className="text-red-400 mb-3 text-sm">{error}</p>}

          {/* ✅ 입장 버튼 */}
          <button
            type="submit"
            disabled={isEntering || (room.isLocked && !password.trim())}
            className="w-full py-2 sm:py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-full text-white font-medium transition cursor-pointer text-sm sm:text-base"
          >
            {isEntering ? "입장 중..." : "입장"}
          </button>
        </form>
      </div>
    </div>
  );
}