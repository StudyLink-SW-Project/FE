import { useState, useEffect } from "react";
import { Users, Lock, Eye, EyeOff, X } from "lucide-react";
import { useSelector } from "react-redux";
import { useTheme } from "../../contexts/ThemeContext";

// 토큰 발급 서버
let APP_SERVER = "https://api.studylink.store/";

export default function JoinRoomModal({ room, isOpen, onClose, onEnter }) {
  const user = useSelector(state => state.auth.user);
  const userName = user?.userName || `Guest_${Math.random().toString(36).slice(2,6)}`;

  // 비밀번호, 표시 토글, 에러, 입장 상태
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState("");
  const [isEntering, setIsEntering] = useState(false);

  // 목표 시간 입력 (시간, 분)
  const [goalHours, setGoalHours] = useState(1);
  const [goalMinutes, setGoalMinutes] = useState(0);
  const [goalSeconds, setGoalSeconds] = useState(0);
  const { isDark } = useTheme(); 

  // 모달 열 때마다 초기화
  useEffect(() => {
    if (isOpen) {
      setPassword("");
      setShowPwd(false);
      setError("");
      setIsEntering(false);
      // 기본 목표시간 초기값 (1시간)
      setGoalHours(1);
      setGoalMinutes(0);
      setGoalSeconds(0);
    }
  }, [isOpen]);

  if (!isOpen || !room) return null;

  async function handleEnter(e) {
    e.preventDefault();
    setError("");
    setIsEntering(true);

    try {
      // 비밀번호 검증
      if (room.isLocked) {
        if (!password.trim()) throw new Error("비밀번호를 입력해주세요.");
        if (password.trim() !== room.password.trim()) throw new Error("비밀번호가 틀렸습니다.");
      }

      // 토큰 발급
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

      const totalGoalSeconds = Number(goalHours) * 3600 + Number(goalMinutes) * 60 + Number(goalSeconds) * 1;

      // 입장 콜백 호출
      onEnter(
        String(room.title),
        token,
        password,
        room.imageNumber,
        totalGoalSeconds,
      );
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsEntering(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-opacity-70 backdrop-brightness-20 p-4">
      <div className={`rounded-2xl w-full max-w-sm mx-4 p-4 sm:p-6 relative shadow-2xl border ${isDark ? 'bg-[#1D1F2C] text-white shadow-black/50 border-gray-600' : 'bg-white text-gray-900 shadow-gray-900/20 border-[#E0E0E0]'}`}>
        {/* 닫기 */}
        <button 
          onClick={onClose} 
          className={`absolute top-3 right-3 p-2 cursor-pointer rounded-full transition-all duration-200 ${isDark ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-lg sm:text-xl font-semibold mb-2 pr-10">{room.title}</h2>
        <div className="flex items-center mb-4 text-sm">
          <Users className={`w-4 h-4 sm:w-5 sm:h-5 mr-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`} />
          <span className="text-sm sm:text-base">{room.participants}/{room.maxParticipants}</span>
        </div>

        {/* 이미지 */}
        <img
          src={room.imageSrc}
          alt={room.title}
          className="w-full h-60 sm:h-70 object-cover rounded-xl mb-4 border border-gray-200"
        />

        {/* 설명 */}
        <p className={`mb-4 sm:mb-6 text-sm sm:text-base ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{room.subtitle}</p>

        <form onSubmit={handleEnter}>
          {/* 비밀번호 입력 (잠긴 방만) */}
          {room.isLocked && (
            <div className="mb-4 sm:mb-6">
              <label className={`flex items-center text-sm mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                <Lock className="w-4 h-4 mr-2" /> 스터디룸 비밀번호
              </label>
              <div className={`flex items-center border rounded-xl px-4 py-3 transition-all duration-200 ${isDark ? 'border-gray-600 bg-[#2A2D3F] focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500' : 'border-[#E0E0E0] bg-gray-50 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 focus-within:bg-white'}`}>
                <input
                  type={showPwd ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="스터디룸 비밀번호를 입력하세요"
                  className={`flex-1 bg-transparent outline-none text-sm sm:text-base ${isDark ? 'placeholder-gray-500 text-white' : 'placeholder-gray-400 text-gray-900'}`}
                  required
                  disabled={isEntering}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((v) => !v)}
                  className={`ml-2 p-1 rounded-lg transition-all duration-200 focus:outline-none ${isDark ? 'text-gray-500 hover:bg-gray-700' : 'text-gray-400 hover:bg-gray-200'}`}
                  disabled={isEntering}
                >
                  {showPwd ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
                </button>
              </div>
            </div>
          )}

          {error && <p className="text-red-400 mb-3 text-sm">{error}</p>}

          {/* 입장 버튼 */}
          <button
            type="submit"
            disabled={isEntering || (room.isLocked && !password.trim())}
            className="w-full py-2 sm:py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-xl text-white font-medium transition-all duration-200 hover:shadow-lg cursor-pointer text-sm sm:text-base"
          >
            {isEntering ? "입장 중..." : "입장"}
          </button>
        </form>
      </div>
    </div>
  );
}
