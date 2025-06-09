// src/components/CreateRoomModal.jsx
import { useEffect, useState } from "react";
import { Home, FileText, X } from "lucide-react";
import { useSelector } from "react-redux";

// 토큰 발급 서버
const APP_SERVER = "https://api.studylink.store/";

export default function CreateRoomModal({ isOpen, onClose, onCreate, onEnter }) {
  const user = useSelector(state => state.auth.user);
  const participantName = user?.userName || "Guest";

  const [roomName, setRoomName] = useState("");
  const [description, setDescription] = useState("");
  const [password, setPassword] = useState("");
  const [maxUsers, setMaxUsers] = useState(16);
  const [bgFile, setBgFile] = useState(null);
  const [error, setError] = useState("");

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 p-4">
      <div className="bg-[#1D1F2C] rounded-2xl w-full max-w-md mx-4 p-6 sm:p-8 relative text-white">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-200 hover:bg-gray-700 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        
        <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 pr-12">스터디 룸 생성 및 입장</h2>
        
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        
        <form className="space-y-4 sm:space-y-6" onSubmit={async e => {
          e.preventDefault();
          setError("");
          try {
            // 1) 방 생성
            onCreate({ roomName, description, password, maxUsers, bgFile, isLocked: password.trim() !== "" });
            // 2) 토큰 발급
            const res = await fetch(`${APP_SERVER}api/v1/video/token`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ roomName: String(roomName), participantName }),
            });
            if (!res.ok) throw new Error("토큰 서버 오류");
            const { token } = await res.json();
            // 3) 입장
            onEnter(String(roomName), token);
            onClose();
          } catch (err) {
            setError(err.message);
          }
        }}>
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
          
          {/* 버튼 */}
          <div className="pt-4 sm:pt-6">
            <button 
              type="submit" 
              className="w-full py-3 sm:py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-full transition cursor-pointer font-medium text-sm sm:text-base"
            >
              생성 후 입장하기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}