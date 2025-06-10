import { useEffect, useState } from "react";
import { Home, FileText, X, Lock, Eye, EyeOff } from "lucide-react";
import { useSelector } from "react-redux";

// 토큰 발급 서버
const APP_SERVER = "https://api.studylink.store/";

// 선택 가능한 배경 이미지 목록 (public/bg 폴더에 위치)
const AVAILABLE_BACKGROUNDS = [
  "/bg/bg-0.jpg",
  "/bg/bg-1.jpg",
  "/bg/bg-2.jpg",
  "/bg/bg-3.jpg",
];

export default function CreateRoomModal({ isOpen, onClose, onCreate, onEnter }) {
  const user = useSelector(state => state.auth.user);
  const participantName = user?.userName || "Guest";

  const [roomName, setRoomName] = useState("");
  const [description, setDescription] = useState("");
  const [maxUsers, setMaxUsers] = useState(16);
  const [bgFile, setBgFile] = useState(null);
  const [error, setError] = useState("");

    // 1) 비밀번호 사용 여부
  const [usePassword, setUsePassword] = useState(false);
  // 2) 실제 비밀번호 값
  const [password, setPassword] = useState("");
  // 3) 입력된 비밀번호 보이기/숨기기 토글
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setRoomName("");
      setDescription("");
      setPassword("");
      setMaxUsers(16);
      setBgFile(null);
      setError("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleBackgroundSelect = (url) => {
    setBgFile(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-xs p-4">
      <div className="bg-[#1D1F2C] rounded-2xl w-full max-w-3xl mx-4 p-6 sm:p-8 relative text-white">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-200 hover:bg-gray-700 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl sm:text-2xl font-semibold mb-6 pr-12">스터디 룸 생성 및 입장</h2>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <form className="flex flex-col md:flex-row gap-6" onSubmit={async e => {
          e.preventDefault();
          setError("");
          try {
            onCreate({ roomName, description, password, maxUsers, bgFile, isLocked: password.trim() !== "" });
            const res = await fetch(`${APP_SERVER}api/v1/video/token`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ roomName: String(roomName), participantName }),
            });
            if (!res.ok) throw new Error("토큰 서버 오류");
            const { token } = await res.json();
            onEnter(String(roomName), token);
            onClose();
          } catch (err) {
            setError(err.message);
          }
        }}>
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

            {/* 비밀번호 입력(선택) */}
            <div>
              {/* 비밀번호 설정 체크박스 */}
              <label className="inline-flex items-center space-x-2 mb-2">
                <span className="text-sm text-gray-300">비밀번호 설정</span>
                <input
                  type="checkbox"
                  className="form-checkbox cursor-pointer"
                  checked={usePassword}
                  onChange={e => setUsePassword(e.target.checked)}
                />
              </label>

              {/* 체크된 경우에만 비밀번호 입력창 표시 */}
              {usePassword && (
                <div className="flex items-center border-b border-gray-600 pb-2">
                  {/* 잠금 아이콘 */}
                  <Lock className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />

                  {/* 비밀번호 필드 (showPassword에 따라 text/password 전환) */}
                  <input
                    id="pw"
                    type={showPassword ? "text" : "password"}
                    placeholder="비밀번호를 입력하세요.."
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="flex-1 bg-transparent text-white placeholder-gray-500 outline-none text-sm sm:text-base"
                    aria-label="비밀번호 입력"
                  />

                  {/* 가시성 토글 버튼 */}
                  <button
                    type="button"
                    className="ml-2 p-1 focus:outline-none"
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
              )}
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

          {/* 오른쪽: 이미지 선택 (2x2 그리드) */}
          <div className="w-full md:w-1/3">
            <label className="block text-sm text-gray-300 mb-2">배경 이미지 선택</label>
            <div className="grid grid-cols-2 grid-rows-2 gap-2">
              {AVAILABLE_BACKGROUNDS.map((url, idx) => (
                <img
                  key={idx}
                  src={url}
                  alt={`bg-${idx}`}
                  className={`cursor-pointer rounded-lg border-2 ${bgFile === url ? 'border-blue-500' : 'border-transparent'} w-full h-24 object-cover`}
                  onClick={() => handleBackgroundSelect(url)}
                />
              ))}
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
