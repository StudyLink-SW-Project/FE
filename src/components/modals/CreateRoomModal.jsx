import { useEffect, useState } from "react";
import { Home, FileText, X, Lock, Eye, EyeOff } from "lucide-react";
import { useSelector } from "react-redux";

// 토큰 발급 서버
const APP_SERVER = "https://api.studylink.store/";
const API = import.meta.env.VITE_APP_SERVER;

// ✅ 선택 가능한 배경 이미지 목록 (1~4 번호 체계)
const AVAILABLE_BACKGROUNDS = [
  "/bg/bg-1.jpg",  // 인덱스 0 → 백엔드에 1로 전송
  "/bg/bg-2.jpg",  // 인덱스 1 → 백엔드에 2로 전송
  "/bg/bg-3.jpg",  // 인덱스 2 → 백엔드에 3로 전송
  "/bg/bg-4.jpg",  // 인덱스 3 → 백엔드에 4로 전송
];

export default function CreateRoomModal({ isOpen, onClose, onCreate, onEnter }) {
  const user = useSelector(state => state.auth.user);
  const participantName = user?.userName || "Guest";

  const [roomName, setRoomName] = useState("");
  const [description, setDescription] = useState("");
  const [maxUsers, setMaxUsers] = useState(16);
  const [bgFile, setBgFile] = useState(0); // ✅ 0번 인덱스로 초기화 (bg-1.jpg)
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
      setUsePassword(false); // ✅ 비밀번호 사용 여부 초기화
      setMaxUsers(16);
      setBgFile(0); // ✅ 첫 번째 이미지(bg-1.jpg)로 초기화
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
      // ✅ 비밀번호 로직 개선
      const finalPassword = usePassword ? password.trim() : "";
      
      // 1) 토큰 발급
      const res = await fetch(`${APP_SERVER}api/v1/video/token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomName: String(roomName), participantName }),
      });
      
      if (!res.ok) throw new Error("토큰 서버 오류");
      
      const { token } = await res.json();
    
      // ✅ onCreate 호출 - bgFile은 인덱스, 실제 이미지 경로도 함께 전달
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
          roomImage: String(bgFile + 1) // ✅ 1~4 번호를 문자열로 전달
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
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-xs p-4">
      <div className="bg-[#1D1F2C] rounded-2xl w-full max-w-3xl mx-4 p-6 sm:p-8 relative text-white min-h-[470px]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-200 hover:bg-gray-700 rounded-lg transition-colors"
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
              <label className="block text-sm text-gray-300 mb-2">방 이름</label>
              <div className="flex items-center border-b border-gray-600 pb-2">
                <Home className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="방 이름을 입력하세요.."
                  value={roomName}
                  onChange={e => setRoomName(e.target.value)}
                  className="flex-1 bg-transparent text-white placeholder-gray-500 outline-none text-sm sm:text-base"
                  required
                />
              </div>
            </div>

            {/* 방 소개 */}
            <div>
              <label className="block text-sm text-gray-300 mb-2">방 소개</label>
              <div className="flex items-center border-b border-gray-600 pb-2">
                <FileText className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="방 소개 문구를 작성하세요.."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="flex-1 bg-transparent text-white placeholder-gray-500 outline-none text-sm sm:text-base"
                />
              </div>
            </div>

            {/* ✅ 비밀번호 입력 개선 */}
            <div>
              <label className="inline-flex items-center space-x-2 mb-2">
                <input
                  type="checkbox"
                  className="form-checkbox cursor-pointer"
                  checked={usePassword}
                  onChange={e => {
                    setUsePassword(e.target.checked);
                    if (!e.target.checked) {
                      setPassword("");
                    }
                  }}
                />
                <span className="text-sm text-gray-300">비밀번호 설정</span>
              </label>

              {/* 여기에 최소 높이(min-h-10) 컨테이너를 두고 */}
              <div className="min-h-10">
                {usePassword ? (
                  <div className="flex items-center border-b border-gray-600 pb-2">
                    <Lock className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="비밀번호를 입력하세요.."
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="flex-1 bg-transparent text-white placeholder-gray-500 outline-none text-sm sm:text-base"
                      aria-label="비밀번호 입력"
                      required={usePassword}
                    />
                    <button
                      type="button"
                      className="ml-2 p-1 focus:outline-none cursor-pointer"
                      onClick={() => setShowPassword(prev => !prev)}
                      aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 표시하기"}
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5 text-gray-400" />
                      ) : (
                        <Eye className="w-5 h-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                ) : (
                  // invisible로 공간은 차지하되 아무것도 안 보이게
                  <div className="invisible">placeholder</div>
                )}
              </div>
            </div>

            {/* 목표 시간 설정 */}
            <div>
              <label className="text-sm text-gray-400 mb-1 block">목표 시간 설정</label>
              <div className="flex items-center space-x-3">
                <input
                  type="number"
                  min="0"
                  value={goalHours}
                  onChange={e => setGoalHours(e.target.value)}
                  className="w-12 h-10 leading-none text-center bg-transparent border-b border-gray-600 outline-none text-white text-sm appearance-none"
                  // disabled={isEntering}
                />
                <span className="text-white">시간</span>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={goalMinutes}
                  onChange={e => setGoalMinutes(e.target.value)}
                  className="w-12 h-10 leading-none text-center bg-transparent border-b border-gray-600 outline-none text-white text-sm appearance-none"
                  // disabled={isEntering}
                />
                <span className="text-white">분</span>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={goalSeconds}
                  onChange={e => setGoalSeconds(e.target.value)}
                  className="w-12 h-10 leading-none text-center bg-transparent border-b border-gray-600 outline-none text-white text-sm appearance-none"
                  // disabled={isEntering}
                />
                <span className="text-white">초</span>
              </div>
            </div>

            {/* 버튼 (모바일) */}
            <div className="pt-4 sm:pt-6 md:hidden">
              <button
                type="submit"
                className="w-full py-3 sm:py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-full transition cursor-pointer font-medium text-sm sm:text-base"
              >
                생성 후 입장하기
              </button>
            </div>
          </div>

          {/* ✅ 오른쪽: 이미지 선택 개선 */}
          <div className="w-full md:w-1/3">
            <label className="block text-sm text-gray-300 mb-2">배경 이미지 선택</label>
            <div className="grid grid-cols-2 grid-rows-2 gap-2">
              {AVAILABLE_BACKGROUNDS.map((url, idx) => (
                <img
                  key={idx}
                  src={url}
                  alt={`배경 이미지 ${idx + 1}`}
                  className={`cursor-pointer rounded-lg border-2 transition-all duration-200 ${
                    bgFile === idx 
                      ? 'border-blue-500 ring-2 ring-blue-500/50' 
                      : 'border-transparent hover:border-gray-400'
                  } w-full h-24 object-cover`}
                  onClick={() => handleBackgroundSelect(idx)}
                />
              ))}
            </div>

            {/* ✅ 선택된 이미지 표시 */}
            <div className="mt-3 text-xs text-gray-400 text-center">
              선택됨: 배경 이미지 {bgFile + 1}
            </div>

            {/* 버튼 (데스크톱) */}
            <div className="hidden md:block pt-6">
              <button
                type="submit"
                className="w-full py-3 sm:py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-full transition cursor-pointer font-medium text-sm sm:text-base"
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