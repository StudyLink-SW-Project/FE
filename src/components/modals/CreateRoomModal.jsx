import { useEffect, useState } from "react";
import { Home, FileText, X, Lock, Eye, EyeOff } from "lucide-react";
import { useSelector } from "react-redux";
import { useTheme } from "../../contexts/ThemeContext";

// 토큰 발급 서버
const APP_SERVER = "https://api.studylink.store/";
const API = import.meta.env.VITE_APP_SERVER;

const AVAILABLE_BACKGROUNDS = [
  "/bg/bg-1.jpg",
  "/bg/bg-2.jpg", 
  "/bg/bg-3.jpg",  
  "/bg/bg-4.jpg",  
];

export default function CreateRoomModal({ isOpen, onClose, onCreate, onEnter }) {
  const user = useSelector(state => state.auth.user);
  const participantName = user?.userName || "Guest";
  const { isDark } = useTheme(); 

  const [roomName, setRoomName] = useState("");
  const [description, setDescription] = useState("");
  const [maxUsers, setMaxUsers] = useState(16);
  const [bgFile, setBgFile] = useState(0); 
  const [error, setError] = useState("");

  // 비밀번호 관련 state
  const [usePassword, setUsePassword] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
    // 목표 시간 입력 (시간, 분)
  const [goalHours, setGoalHours] = useState(1);
  const [goalMinutes, setGoalMinutes] = useState(0);
  const [goalSeconds, setGoalSeconds] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setRoomName("");
      setDescription("");
      setPassword("");
      setUsePassword(false); 
      setMaxUsers(16);
      setBgFile(0); 
      setError("");
      setGoalHours(1);
      setGoalMinutes(0);
      setGoalSeconds(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleBackgroundSelect = (idx) => {
    setBgFile(idx);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    try {
      const finalPassword = usePassword ? password.trim() : "";
      
      // 1) 토큰 발급
      const res = await fetch(`${APP_SERVER}api/v1/video/token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomName: String(roomName), participantName }),
      });
      
      if (!res.ok) throw new Error("토큰 서버 오류");
      
      const { token } = await res.json();
    
      onCreate({ 
        roomName, 
        description, 
        password: finalPassword, 
        maxUsers, 
        bgFile, // 인덱스 (0,1,2,3)
        bgImagePath: AVAILABLE_BACKGROUNDS[bgFile], // 실제 이미지 경로
        isLocked: finalPassword !== "" 
      });
      
      const totalGoalSeconds = Number(goalHours) * 3600 + Number(goalMinutes) * 60 + Number(goalSeconds) * 1;

      // ✅ onEnter 호출 - 백엔드 번호(1~4)와 실제 이미지 경로 전달
      onEnter(String(roomName), token, finalPassword, bgFile + 1, totalGoalSeconds); // bgFile+1로 1~4 번호 전달
      
      // 2) 서버에 방 설정 정보 저장
      await fetch(`${API}room/set`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomName: String(roomName),
          password: finalPassword,
          roomImage: String(bgFile + 1)
        }),
      }).then(res => {
        if (!res.ok) throw new Error("방 설정 저장 오류");
      });

      onClose();

    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-999 flex items-center justify-center backdrop-opacity-70 backdrop-brightness-20 p-4">
      <div className={`rounded-2xl w-full max-w-3xl mx-4 p-6 sm:p-8 relative shadow-2xl border  min-h-[470px] ${isDark ? 'bg-[#1D1F2C] text-white shadow-black/50 border-gray-600' : 'bg-white text-gray-900 shadow-gray-900/20 border-[#E0E0E0]'}`}>
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 p-2 rounded-full transition-all duration-200 ${isDark ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl sm:text-2xl font-semibold mb-6 pr-12">스터디 룸 생성 및 입장</h2>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <form className="flex flex-col md:flex-row gap-6" onSubmit={handleSubmit}>
          {/* 왼쪽: 입력 필드 */}
          <div className="flex-1 space-y-4 sm:space-y-6">
            {/* 방 이름 */}
            <div>
              <label className={`block text-sm mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>방 이름<span div className="text-red-500 ml-2">*</span></label>
              <div className={`flex items-center border rounded-xl px-4 py-3 transition-all duration-200 ${isDark ? 'border-gray-600 bg-[#2A2D3F] focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500' : 'border-[#E0E0E0] bg-gray-50 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 focus-within:bg-white'}`}>
                <Home className={`w-5 h-5 mr-3 flex-shrink-0 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                <input
                  type="text"
                  placeholder="방 이름을 입력하세요.."
                  value={roomName}
                  onChange={e => setRoomName(e.target.value)}
                  className={`flex-1 bg-transparent outline-none text-sm sm:text-base ${isDark ? 'text-white placeholder-gray-500' : 'text-gray-900 placeholder-gray-400'}`}
                  required
                />
              </div>
            </div>

            {/* 방 소개 */}
            <div>
              <label className={`block text-sm mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>방 소개</label>
              <div className={`flex items-center border rounded-xl px-4 py-3 transition-all duration-200 ${isDark ? 'border-gray-600 bg-[#2A2D3F] focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500' : 'border-[#E0E0E0] bg-gray-50 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 focus-within:bg-white'}`}>
                <FileText className={`w-5 h-5 mr-3 flex-shrink-0 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                <input
                  type="text"
                  placeholder="방 소개 문구를 작성하세요.."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className={`flex-1 bg-transparent outline-none text-sm sm:text-base ${isDark ? 'text-white placeholder-gray-500' : 'text-gray-900 placeholder-gray-400'}`}
                />
              </div>
            </div>

            {/* 비밀번호 입력 */}
            <div>
              <label className="inline-flex items-center space-x-2 mb-3">
                <input
                  type="checkbox"
                  className="form-checkbox cursor-pointer rounded transition-all duration-200"
                  checked={usePassword}
                  onChange={e => {
                    setUsePassword(e.target.checked);
                    if (!e.target.checked) {
                      setPassword("");
                    }
                  }}
                />
                <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>비밀번호 설정</span>
              </label>

              {/* 여기에 최소 높이(min-h-10) 컨테이너를 두고 */}
              <div className="min-h-15">
                {usePassword ? (
                  <div className={`flex items-center border rounded-xl px-4 py-3 transition-all duration-200 ${isDark ? 'border-gray-600 bg-[#2A2D3F] focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500' : 'border-[#E0E0E0] bg-gray-50 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 focus-within:bg-white'}`}>
                    <Lock className={`w-5 h-5 mr-3 flex-shrink-0 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="비밀번호를 입력하세요.."
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className={`flex-1 bg-transparent outline-none text-sm sm:text-base ${isDark ? 'text-white placeholder-gray-500' : 'text-gray-900 placeholder-gray-400'}`}
                      aria-label="비밀번호 입력"
                      required={usePassword}
                    />
                    <button
                      type="button"
                      className={`ml-2 p-1 rounded-lg transition-all duration-200 focus:outline-none ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
                      onClick={() => setShowPassword(prev => !prev)}
                      aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 표시하기"}
                    >
                      {showPassword ? (
                        <EyeOff className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                      ) : (
                        <Eye className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                      )}
                    </button>
                  </div>
                ) : (
                      // invisible로 공간은 차지하되 아무것도 안 보이게
                      <div className="invisible">placeholder</div>
                )}
              </div>
            </div>

            {/* 버튼 (모바일) */}
            <div className="pt-0 sm:pt-6 md:hidden">
              <button
                type="submit"
                className="w-full py-3 sm:py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all duration-200 hover:shadow-lg cursor-pointer font-medium text-sm sm:text-base"
              >
                생성 후 입장하기
              </button>
            </div>
          </div>

          {/* 오른쪽: 이미지 선택 */}
          <div className="w-full md:w-1/3">
            <label className={`block text-sm mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>배경 이미지 선택</label>
            <div className="grid grid-cols-2 grid-rows-2 gap-2">
              {AVAILABLE_BACKGROUNDS.map((url, idx) => (
                <img
                  key={idx}
                  src={url}
                  alt={`배경 이미지 ${idx + 1}`}
                  className={`cursor-pointer rounded-xl border-2 transition-all duration-200 w-full h-24 sm:h-24 lg:h-24 object-cover hover:scale-105 ${bgFile === idx ? 'border-blue-500 ring-2 ring-blue-500/50 shadow-lg' : `border-transparent ${isDark ? 'hover:border-gray-400' : 'hover:border-gray-300'} hover:shadow-md`}`}
                  onClick={() => handleBackgroundSelect(idx)}
                />
              ))}
            </div>

            {/* 선택된 이미지 표시 */}
            <div className={`mt-3 text-xs text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              이미지 {bgFile + 1}
            </div>

            {/* 버튼 (데스크탑) */}
            <div className="hidden md:block pt-6 mt-13">
              <button
                type="submit"
                className="w-full py-3 sm:py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all duration-200 hover:shadow-lg cursor-pointer font-medium text-sm sm:text-base"
              >
                생성 후 입장하기
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}